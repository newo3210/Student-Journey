//Mariano Montini ('bosque', 'bosquestudio')

// DOM references - form controls and preview sheet.
const nameInput = document.getElementById('name-input')
const classSelect = document.getElementById('class-select')
const traitsBox = document.getElementById('traits-box')
const powersBox = document.getElementById('powers-box')
const statsBox = document.getElementById('stats-box')
const pointsLeftEl = document.getElementById('points-left')
const sheetEl = document.getElementById('sheet')
const resetBtn = document.getElementById('reset-btn')

// Point budget constants - total pool and per-stat limits.
const TOTAL_POINTS = 10
const STAT_MIN = 1
const STAT_MAX = 8
const MAX_POWERS = 2

// Class catalog - each class has a label and its available powers (array).
const CLASSES = [
  {
    id: 'warrior',
    label: 'Guerrero',
    powers: ['Golpe pesado', 'Escudo firme', 'Grito de guerra'],
  },
  {
    id: 'mage',
    label: 'Mago',
    powers: ['Bola de fuego', 'Escudo arcano', 'Teletransporte'],
  },
  {
    id: 'rogue',
    label: 'Pícaro',
    powers: ['Puñalada', 'Humo', 'Robo de bolsillo'],
  },
  {
    id: 'ranger',
    label: 'Explorador',
    powers: ['Flecha certera', 'Trampa', 'Compañero animal'],
  },
]

// Trait catalog - optional personality/flavor tags stored in an array.
const ALL_TRAITS = ['Valiente', 'Curioso', 'Sigiloso', 'Sabio', 'Impulsivo', 'Leal']

// Stat keys - attributes the player can raise/lower with + / -.
const STAT_KEYS = ['fuerza', 'agilidad', 'inteligencia', 'carisma']

// Avatar state object - single source of truth for the character sheet.
const avatar = {
  name: 'Aria',
  classId: 'warrior',
  traits: ['Valiente'],
  powers: ['Golpe pesado'],
  stats: {
    fuerza: 3,
    agilidad: 2,
    inteligencia: 2,
    carisma: 2,
  },
}

// Spent points - sum of (stat - minimum) across all attributes.
function getSpentPoints() {
  let spent = 0
  for (let i = 0; i < STAT_KEYS.length; i++) {
    const key = STAT_KEYS[i]
    spent = spent + (avatar.stats[key] - STAT_MIN)
  }
  return spent
}

// Remaining points - budget left to distribute.
function getRemainingPoints() {
  return TOTAL_POINTS - getSpentPoints()
}

// Find class - locate class object by id inside CLASSES array.
function findClassById(classId) {
  for (let i = 0; i < CLASSES.length; i++) {
    if (CLASSES[i].id === classId) {
      return CLASSES[i]
    }
  }
  return CLASSES[0]
}

// Add point - increase one stat if budget and max allow it.
function addPoint(statKey) {
  const remaining = getRemainingPoints()
  const current = avatar.stats[statKey]
  const canAdd = remaining > 0 && current < STAT_MAX
  if (!canAdd) {
    return false
  }
  avatar.stats[statKey] = current + 1
  return true
}

// Remove point - decrease one stat if above minimum.
function removePoint(statKey) {
  const current = avatar.stats[statKey]
  const canRemove = current > STAT_MIN
  if (!canRemove) {
    return false
  }
  avatar.stats[statKey] = current - 1
  return true
}

// Toggle trait - add or remove a trait string from the traits array.
function toggleTrait(trait) {
  const index = avatar.traits.indexOf(trait)
  if (index === -1) {
    avatar.traits.push(trait)
  } else {
    avatar.traits.splice(index, 1)
  }
}

// Toggle power - keep at most MAX_POWERS selected from the current class list.
function togglePower(power) {
  const index = avatar.powers.indexOf(power)
  if (index !== -1) {
    avatar.powers.splice(index, 1)
    return
  }
  if (avatar.powers.length >= MAX_POWERS) {
    return
  }
  avatar.powers.push(power)
}

// Sync powers to class - drop powers that do not belong to the selected class.
function syncPowersToClass() {
  const currentClass = findClassById(avatar.classId)
  const allowed = currentClass.powers
  const next = []
  for (let i = 0; i < avatar.powers.length; i++) {
    const power = avatar.powers[i]
    if (allowed.indexOf(power) !== -1) {
      next.push(power)
    }
  }
  avatar.powers = next
}

// Reset build - restore a clean starter avatar object.
function resetAvatar() {
  avatar.name = 'Aria'
  avatar.classId = 'warrior'
  avatar.traits = ['Valiente']
  avatar.powers = ['Golpe pesado']
  avatar.stats = {
    fuerza: 3,
    agilidad: 2,
    inteligencia: 2,
    carisma: 2,
  }
  nameInput.value = avatar.name
  classSelect.value = avatar.classId
}

// Render class options - fill the <select> from CLASSES array.
function renderClassOptions() {
  classSelect.innerHTML = ''
  for (let i = 0; i < CLASSES.length; i++) {
    const item = CLASSES[i]
    const option = document.createElement('option')
    option.value = item.id
    option.textContent = item.label
    classSelect.appendChild(option)
  }
  classSelect.value = avatar.classId
}

// Render traits - chip buttons bound to the traits array.
function renderTraits() {
  traitsBox.innerHTML = ''
  for (let i = 0; i < ALL_TRAITS.length; i++) {
    const trait = ALL_TRAITS[i]
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'chip' + (avatar.traits.indexOf(trait) !== -1 ? ' is-on' : '')
    button.textContent = trait
    button.addEventListener('click', function onTraitClick() {
      toggleTrait(trait)
      renderAll()
    })
    traitsBox.appendChild(button)
  }
}

// Render powers - chips from the selected class power list.
function renderPowers() {
  powersBox.innerHTML = ''
  const currentClass = findClassById(avatar.classId)
  for (let i = 0; i < currentClass.powers.length; i++) {
    const power = currentClass.powers[i]
    const selected = avatar.powers.indexOf(power) !== -1
    const full = !selected && avatar.powers.length >= MAX_POWERS
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'chip' + (selected ? ' is-on' : '')
    button.textContent = power
    button.disabled = full
    button.addEventListener('click', function onPowerClick() {
      togglePower(power)
      renderAll()
    })
    powersBox.appendChild(button)
  }
}

// Render stats - +/- controls calling addPoint / removePoint.
function renderStats() {
  statsBox.innerHTML = ''
  const remaining = getRemainingPoints()
  pointsLeftEl.textContent = 'Puntos restantes: ' + remaining

  for (let i = 0; i < STAT_KEYS.length; i++) {
    const key = STAT_KEYS[i]
    const value = avatar.stats[key]
    const row = document.createElement('div')
    row.className = 'stat-row'

    const label = document.createElement('span')
    label.textContent = key.charAt(0).toUpperCase() + key.slice(1)

    const controls = document.createElement('div')
    controls.className = 'stat-controls'

    const minusBtn = document.createElement('button')
    minusBtn.type = 'button'
    minusBtn.textContent = '−'
    minusBtn.disabled = value <= STAT_MIN
    minusBtn.addEventListener('click', function onMinus() {
      removePoint(key)
      renderAll()
    })

    const valueEl = document.createElement('span')
    valueEl.className = 'stat-value'
    valueEl.textContent = String(value)

    const plusBtn = document.createElement('button')
    plusBtn.type = 'button'
    plusBtn.textContent = '+'
    plusBtn.disabled = remaining <= 0 || value >= STAT_MAX
    plusBtn.addEventListener('click', function onPlus() {
      addPoint(key)
      renderAll()
    })

    controls.appendChild(minusBtn)
    controls.appendChild(valueEl)
    controls.appendChild(plusBtn)
    row.appendChild(label)
    row.appendChild(controls)
    statsBox.appendChild(row)
  }
}

// Render sheet - printable summary of the avatar object.
function renderSheet() {
  const currentClass = findClassById(avatar.classId)
  const traitsText = avatar.traits.length > 0 ? avatar.traits.join(', ') : '(ninguno)'
  const powersText = avatar.powers.length > 0 ? avatar.powers.join(', ') : '(ninguno)'
  const ready = getRemainingPoints() === 0 ? 'sí' : 'no (aún hay puntos sin usar)'

  sheetEl.textContent =
    'NOMBRE: ' + avatar.name + '\n' +
    'CLASE:  ' + currentClass.label + '\n' +
    'RASGOS: ' + traitsText + '\n' +
    'PODERES:' + powersText + '\n' +
    'STATS:\n' +
    '  fuerza        ' + avatar.stats.fuerza + '\n' +
    '  agilidad      ' + avatar.stats.agilidad + '\n' +
    '  inteligencia  ' + avatar.stats.inteligencia + '\n' +
    '  carisma       ' + avatar.stats.carisma + '\n' +
    'PUNTOS RESTANTES: ' + getRemainingPoints() + '\n' +
    'BUILD LISTA: ' + ready
}

// Render all - refresh every UI section from avatar state.
function renderAll() {
  renderTraits()
  renderPowers()
  renderStats()
  renderSheet()
}

// Name input handler - update avatar.name string on each keystroke.
nameInput.addEventListener('input', function onNameInput() {
  const raw = nameInput.value.trim()
  avatar.name = raw.length > 0 ? raw : 'Sin nombre'
  renderSheet()
})

// Class change handler - switch classId, sync powers array, re-render.
classSelect.addEventListener('change', function onClassChange() {
  avatar.classId = classSelect.value
  syncPowersToClass()
  renderAll()
})

// Reset handler - restore defaults and redraw.
resetBtn.addEventListener('click', function onReset() {
  resetAvatar()
  renderAll()
})

// Boot - fill class select once, then paint the whole UI.
renderClassOptions()
renderAll()
