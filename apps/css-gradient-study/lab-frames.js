//Mariano Montini ('bosque', 'bosquestudio')

/*
  DECISION
  Objetivo: mismos controles que lab v2, pero el preview son frames de UI
    (barras, dialog, chips, card, ring) donde el degrade se enmascara.
  Particion: state/controles iguales a lab v2 -> applyPreview pisa TODOS los
    [data-grad] dentro de frames.html -> buildGeneratedHtml exporta un
    ejemplo de barra (fill + track). styles.css / frames.css no se escriben.
  Definiciones: PRESET_PALETTES, state, applyGradToElement, applyPreview,
    buildGeneratedHtml, parseGeneratedHtml.
*/

// Paletas de preset - espejo en hex de indigo/silver en styles.css.
const PRESET_PALETTES = {
  indigo: [
    '#3f29ae',
    '#cc2fda',
    '#e1476d',
    '#ca7a2b',
    '#66a329',
    '#2c9658',
    '#2c7c8c',
    '#29447a',
  ],
  silver: [
    '#f8fafc',
    '#e2e8f0',
    '#cbd5e1',
    '#f1f5f9',
    '#94a3b8',
    '#e2e8f0',
    '#cbd5e1',
    '#64748b',
  ],
}

// Estado de controles - fuente compartida por UI, codigo y preview.
const state = {
  type: 'conic',
  theme: 'indigo',
  colores: 5,
  pan: 'diag',
  motion: 'running',
  speed: 50,
  angle: 125,
  originX: 50,
  originY: 50,
  palette: [...PRESET_PALETTES.indigo],
}

const PREFIXES = {
  typeAlt: ['grad-surface--linear', 'grad-surface--radial', 'grad-surface--conic'],
  theme: ['grad-surface--indigo', 'grad-surface--silver'],
  colores: 'grad-surface--colores-',
  pan: 'grad-surface--pan-',
  motion: ['is-running', 'is-stopped'],
}

// Timing codigo -> preview - debounce para no parsear en cada tecla cruda.
const CODE_SYNC_MS = 220

// Puentes DOM.
const preview = document.getElementById('preview')
const originGate = document.getElementById('origin-gate')
const codeOut = document.getElementById('code-out')
const btnCopy = document.getElementById('btn-copy')
const btnResetPalette = document.getElementById('btn-reset-palette')
const paletteGrid = document.getElementById('palette-grid')
const ctrl = {
  type: document.getElementById('ctrl-type'),
  theme: document.getElementById('ctrl-theme'),
  colores: document.getElementById('ctrl-colores'),
  pan: document.getElementById('ctrl-pan'),
  motion: document.getElementById('ctrl-motion'),
  speed: document.getElementById('ctrl-speed'),
  angle: document.getElementById('ctrl-angle'),
  ox: document.getElementById('ctrl-ox'),
  oy: document.getElementById('ctrl-oy'),
}
const out = {
  colores: document.getElementById('out-colores'),
  speed: document.getElementById('out-speed'),
  angle: document.getElementById('out-angle'),
  ox: document.getElementById('out-ox'),
  oy: document.getElementById('out-oy'),
}

let lastTheme = state.theme
let codeSyncTimer = 0
let suppressCodeWrite = false

function isFileOrigin() {
  return window.location.protocol === 'file:'
}

function showOriginGate() {
  if (originGate) originGate.hidden = false
  document.body.classList.add('is-blocked')
  preview.removeAttribute('src')
  codeOut.value = '/* bloqueado bajo file: — usa npx serve */'
}

function getPreviewDoc() {
  try {
    return preview.contentDocument
  } catch {
    return null
  }
}

function stripClasses(el, classNames) {
  classNames.forEach((name) => el.classList.remove(name))
}

function stripPrefixed(el, prefix) {
  ;[...el.classList].forEach((name) => {
    if (name.startsWith(prefix)) el.classList.remove(name)
  })
}

function normalizeHex(value, fallback) {
  const raw = String(value).trim()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const r = raw[1]
    const g = raw[2]
    const b = raw[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return fallback
}

function loadPaletteFromPreset(theme) {
  state.palette = [...PRESET_PALETTES[theme]]
}

function mountPaletteInputs() {
  paletteGrid.replaceChildren()

  state.palette.forEach((hex, index) => {
    const row = document.createElement('label')
    row.className = 'swatch'
    if (index >= state.colores) row.classList.add('is-idle')

    const name = document.createElement('span')
    name.textContent = `c${index + 1}`

    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.value = hex
    colorInput.dataset.index = String(index)

    const textInput = document.createElement('input')
    textInput.type = 'text'
    textInput.value = hex
    textInput.spellcheck = false
    textInput.dataset.index = String(index)

    colorInput.addEventListener('input', () => {
      const i = Number(colorInput.dataset.index)
      state.palette[i] = colorInput.value.toLowerCase()
      textInput.value = state.palette[i]
      renderFromControls()
    })

    textInput.addEventListener('change', () => {
      const i = Number(textInput.dataset.index)
      const next = normalizeHex(textInput.value, state.palette[i])
      state.palette[i] = next
      textInput.value = next
      colorInput.value = next
      renderFromControls()
    })

    row.append(name, colorInput, textInput)
    paletteGrid.append(row)
  })
}

// Aplica el state a UN frame - clases de eje + tokens + --c* en memoria.
function applyGradToElement(el) {
  el.classList.add('grad-surface')

  stripClasses(el, PREFIXES.typeAlt)
  el.classList.add(`grad-surface--${state.type}`)

  stripClasses(el, PREFIXES.theme)
  el.classList.add(`grad-surface--${state.theme}`)

  stripPrefixed(el, PREFIXES.colores)
  el.classList.add(`grad-surface--colores-${state.colores}`)

  stripPrefixed(el, PREFIXES.pan)
  el.classList.add(`grad-surface--pan-${state.pan}`)

  stripClasses(el, PREFIXES.motion)
  el.classList.add(state.motion === 'running' ? 'is-running' : 'is-stopped')

  el.style.setProperty('--grad-speed', String(state.speed))
  el.style.setProperty('--grad-angle', `${state.angle}deg`)
  el.style.setProperty('--grad-origin-x', `${state.originX}%`)
  el.style.setProperty('--grad-origin-y', `${state.originY}%`)

  state.palette.forEach((hex, index) => {
    el.style.setProperty(`--c${index + 1}`, hex)
  })
}

// Apply preview - todos los [data-grad] de frames.html reciben el mismo look.
function applyPreview() {
  const doc = getPreviewDoc()
  if (!doc) return

  doc.querySelectorAll('[data-grad]').forEach((el) => applyGradToElement(el))
}

// Serializa un ejemplo de barra - el entregable tipico de uso enmascarado.
function buildGeneratedHtml() {
  const className = [
    'fill',
    'fill-wide',
    'grad-surface',
    `grad-surface--${state.type}`,
    `grad-surface--${state.theme}`,
    `grad-surface--colores-${state.colores}`,
    `grad-surface--pan-${state.pan}`,
    state.motion === 'running' ? 'is-running' : 'is-stopped',
  ].join(' ')

  const paletteStyle = state.palette
    .map((hex, index) => `--c${index + 1}: ${hex}`)
    .join('; ')

  const style = [
    `--grad-speed: ${state.speed}`,
    `--grad-angle: ${state.angle}deg`,
    `--grad-origin-x: ${state.originX}%`,
    `--grad-origin-y: ${state.originY}%`,
    paletteStyle,
  ].join('; ')

  return `<!-- Ejemplo: progress thin (el track recorta / enmascara el degrade) -->
<div class="track track-thin">
  <div
    class="${className}"
    data-grad
    style="${style}"
    aria-hidden="true"
  ></div>
</div>`
}

// Parse del HTML editable - busca el primer .grad-surface / [data-grad].
function parseGeneratedHtml(htmlText) {
  const parsed = new DOMParser().parseFromString(htmlText, 'text/html')
  const el =
    parsed.querySelector('[data-grad], .grad-surface') ||
    (parsed.body?.classList.contains('grad-surface') ? parsed.body : null)
  if (!el) return false

  const classList = [...el.classList]

  const type = classList.find((c) =>
    ['grad-surface--linear', 'grad-surface--radial', 'grad-surface--conic'].includes(c),
  )
  const theme = classList.find((c) =>
    ['grad-surface--indigo', 'grad-surface--silver'].includes(c),
  )
  const coloresClass = classList.find((c) => c.startsWith('grad-surface--colores-'))
  const panClass = classList.find((c) => c.startsWith('grad-surface--pan-'))

  if (type) state.type = type.replace('grad-surface--', '')
  if (theme) state.theme = theme.replace('grad-surface--', '')
  if (coloresClass) {
    const n = Number(coloresClass.replace('grad-surface--colores-', ''))
    if (n >= 2 && n <= 8) state.colores = n
  }
  if (panClass) state.pan = panClass.replace('grad-surface--pan-', '')
  state.motion = classList.includes('is-stopped') ? 'stopped' : 'running'

  const style = el.getAttribute('style') || ''
  const readToken = (name, fallback) => {
    const match = style.match(new RegExp(`${name}\\s*:\\s*([^;]+)`, 'i'))
    return match ? match[1].trim() : fallback
  }

  const speed = Number.parseInt(readToken('--grad-speed', String(state.speed)), 10)
  if (!Number.isNaN(speed)) state.speed = Math.min(100, Math.max(0, speed))

  const angle = Number.parseFloat(readToken('--grad-angle', `${state.angle}deg`))
  if (!Number.isNaN(angle)) state.angle = Math.min(360, Math.max(0, angle))

  const ox = Number.parseFloat(readToken('--grad-origin-x', `${state.originX}%`))
  if (!Number.isNaN(ox)) state.originX = Math.min(100, Math.max(0, ox))

  const oy = Number.parseFloat(readToken('--grad-origin-y', `${state.originY}%`))
  if (!Number.isNaN(oy)) state.originY = Math.min(100, Math.max(0, oy))

  for (let i = 0; i < 8; i += 1) {
    const hex = readToken(`--c${i + 1}`, state.palette[i])
    state.palette[i] = normalizeHex(hex, state.palette[i])
  }

  lastTheme = state.theme
  return true
}

// Controles <- state - al editar codigo a mano hay que realinear sliders/selects.
function applyStateToControls() {
  ctrl.type.value = state.type
  ctrl.theme.value = state.theme
  ctrl.colores.value = String(state.colores)
  ctrl.pan.value = state.pan
  ctrl.motion.value = state.motion
  ctrl.speed.value = String(state.speed)
  ctrl.angle.value = String(state.angle)
  ctrl.ox.value = String(state.originX)
  ctrl.oy.value = String(state.originY)
  mountPaletteInputs()
}

function syncControlLabels() {
  out.colores.textContent = String(state.colores)
  out.speed.textContent = String(state.speed)
  out.angle.textContent = `${state.angle}deg`
  out.ox.textContent = `${state.originX}%`
  out.oy.textContent = `${state.originY}%`

  paletteGrid.querySelectorAll('.swatch').forEach((row, index) => {
    row.classList.toggle('is-idle', index >= state.colores)
  })
}

// Write del panel codigo - no pisa el textarea si el usuario lo esta editando
// hacia el preview (suppressCodeWrite) o si el caret esta ahi y el texto ya
// coincide; desde controles siempre reescribe el HTML generado.
function writeCodePanel() {
  if (suppressCodeWrite) return
  const next = buildGeneratedHtml()
  if (codeOut.value !== next) codeOut.value = next
}

function renderFromControls() {
  applyPreview()
  syncControlLabels()
  writeCodePanel()
}

function renderFromCode() {
  const ok = parseGeneratedHtml(codeOut.value)
  if (!ok) return
  suppressCodeWrite = true
  applyStateToControls()
  syncControlLabels()
  applyPreview()
  suppressCodeWrite = false
}

function readControlsIntoState() {
  const nextTheme = ctrl.theme.value
  state.type = ctrl.type.value
  state.theme = nextTheme
  state.colores = Number(ctrl.colores.value)
  state.pan = ctrl.pan.value
  state.motion = ctrl.motion.value
  state.speed = Number(ctrl.speed.value)
  state.angle = Number(ctrl.angle.value)
  state.originX = Number(ctrl.ox.value)
  state.originY = Number(ctrl.oy.value)

  if (nextTheme !== lastTheme) {
    loadPaletteFromPreset(nextTheme)
    lastTheme = nextTheme
    mountPaletteInputs()
  }
}

function onControlChange() {
  readControlsIntoState()
  renderFromControls()
}

// Edicion manual del codigo - debounce y luego parse -> preview + controles.
function onCodeInput() {
  window.clearTimeout(codeSyncTimer)
  codeSyncTimer = window.setTimeout(renderFromCode, CODE_SYNC_MS)
}

function resetPaletteToPreset() {
  loadPaletteFromPreset(state.theme)
  mountPaletteInputs()
  renderFromControls()
}

async function copyCode() {
  const text = codeOut.value || buildGeneratedHtml()
  try {
    await navigator.clipboard.writeText(text)
    btnCopy.textContent = 'Copiado'
    window.setTimeout(() => {
      btnCopy.textContent = 'Copiar'
    }, 1200)
  } catch {
    codeOut.focus()
    codeOut.select()
  }
}

Object.values(ctrl).forEach((el) => {
  el.addEventListener('input', onControlChange)
  el.addEventListener('change', onControlChange)
})
codeOut.addEventListener('input', onCodeInput)
btnCopy.addEventListener('click', copyCode)
btnResetPalette.addEventListener('click', resetPaletteToPreset)

preview.addEventListener('load', () => {
  renderFromControls()
})

function boot() {
  if (isFileOrigin()) {
    showOriginGate()
    return
  }
  loadPaletteFromPreset(state.theme)
  mountPaletteInputs()
  readControlsIntoState()
  syncControlLabels()
  writeCodePanel()
}

boot()
