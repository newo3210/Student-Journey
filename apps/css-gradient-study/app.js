//Mariano Montini ('bosque', 'bosquestudio')

/*
  DECISION
  Objetivo: UI de lab que abre index.html + styles.css y previsualiza el estudio real.
  Particion: el iframe carga index.html; los editores cargan esos archivos; cada edit
    parcha contentDocument (CSS + body) con debounce. Bajo file: el browser trata cada
    archivo como origen opaco, asi que se bloquea el lab y se pide serve por http.
  Definiciones: preview/htmlEditor/cssEditor/originGate, SYNC_DELAY_MS, syncTimer,
    isFileOrigin / showOriginGate / getPreviewDoc / applyCssToPreview /
    applyHtmlToPreview / scheduleSync / loadSeeds.
*/

// Puentes DOM - preview = index.html; textareas = fuentes editables; gate = aviso file:.
const preview = document.getElementById('preview')
const htmlEditor = document.getElementById('html-editor')
const cssEditor = document.getElementById('css-editor')
const originGate = document.getElementById('origin-gate')

// Timing de sync - debounce para no remarcar el DOM del estudio en cada tecla.
const SYNC_DELAY_MS = 180
let syncTimer = 0

// Origen file: - cada URL file: es unica; fetch y contentDocument entre
// lab.html / index.html / styles.css quedan bloqueados por diseno del browser.
function isFileOrigin() {
  return window.location.protocol === 'file:'
}

// Gate de seguridad - muestra el aviso y marca el layout como bloqueado.
function showOriginGate() {
  if (originGate) originGate.hidden = false
  document.body.classList.add('is-blocked')
  htmlEditor.value =
    '<!-- Bloqueado bajo file: — servi la carpeta por http (ver aviso arriba). -->'
  cssEditor.value = '/* Bloqueado bajo file: — servi la carpeta por http. */'
  preview.removeAttribute('src')
}

// Acceso al documento del preview - same-origin solo con http(s); null si opaco.
function getPreviewDoc() {
  try {
    return preview.contentDocument
  } catch {
    return null
  }
}

// CSS live en el estudio - desactiva el <link> de styles.css y escribe #live-css
// para que el texto del editor sea la unica hoja activa dentro del iframe.
function applyCssToPreview() {
  const doc = getPreviewDoc()
  if (!doc || !doc.head) return

  doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    link.disabled = true
  })

  let style = doc.getElementById('live-css')
  if (!style) {
    style = doc.createElement('style')
    style.id = 'live-css'
    doc.head.appendChild(style)
  }
  style.textContent = cssEditor.value
}

// HTML live en el estudio - parsea el editor y pisa body (clases, style, contenido)
// sobre el index.html ya montado en el iframe, sin recargar la URL.
function applyHtmlToPreview() {
  const doc = getPreviewDoc()
  if (!doc || !doc.body) return

  const parsed = new DOMParser().parseFromString(htmlEditor.value, 'text/html')
  if (!parsed.body) return

  doc.body.className = parsed.body.className
  const styleAttr = parsed.body.getAttribute('style')
  if (styleAttr) doc.body.setAttribute('style', styleAttr)
  else doc.body.removeAttribute('style')
  doc.body.innerHTML = parsed.body.innerHTML
}

// Paint del preview - aplica ambos editores al index.html abierto en el iframe.
function renderPreview() {
  applyCssToPreview()
  applyHtmlToPreview()
}

// Coalesce de input - solo el ultimo edit del rafaga parcha el estudio.
function scheduleSync() {
  window.clearTimeout(syncTimer)
  syncTimer = window.setTimeout(renderPreview, SYNC_DELAY_MS)
}

// Bootstrap - si es file: corta; si es http abre index.html + styles.css y alinea el iframe.
async function loadSeeds() {
  if (isFileOrigin()) {
    showOriginGate()
    return
  }

  const [htmlRes, cssRes] = await Promise.all([
    fetch('./index.html'),
    fetch('./styles.css'),
  ])

  if (!htmlRes.ok || !cssRes.ok) {
    htmlEditor.value = '<!-- no se pudo cargar index.html -->'
    cssEditor.value = '/* no se pudo cargar styles.css */'
    return
  }

  htmlEditor.value = await htmlRes.text()
  cssEditor.value = await cssRes.text()
  renderPreview()
}

// Cuando el estudio termina de montarse en el iframe, se reaplican los editores.
preview.addEventListener('load', renderPreview)

// Suscripciones - editar HTML o CSS parcha el index.html del preview.
htmlEditor.addEventListener('input', scheduleSync)
cssEditor.addEventListener('input', scheduleSync)

loadSeeds()
