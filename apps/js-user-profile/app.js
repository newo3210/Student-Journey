//Mariano Montini ('bosque', 'bosquestudio')

// DOM references - form fields, actions, and preview panels.
const nameInput = document.getElementById('name-input')
const ageInput = document.getElementById('age-input')
const emailInput = document.getElementById('email-input')
const cityInput = document.getElementById('city-input')
const roleSelect = document.getElementById('role-select')
const activeSelect = document.getElementById('active-select')
const hobbyInput = document.getElementById('hobby-input')
const hobbyAddBtn = document.getElementById('hobby-add-btn')
const hobbyChips = document.getElementById('hobby-chips')
const saveBtn = document.getElementById('save-btn')
const resetBtn = document.getElementById('reset-btn')
const formError = document.getElementById('form-error')
const cardEl = document.getElementById('card')
const objectViewEl = document.getElementById('object-view')

// Role labels - map role id string to a readable Spanish label.
const ROLE_LABELS = {
  student: 'Estudiante',
  junior: 'Junior Developer',
  mentor: 'Mentor',
}

// Default user factory - returns a fresh user object (not a shared reference).
function createDefaultUser() {
  return {
    name: 'Mariano',
    age: 28,
    email: 'mariano@example.com',
    city: 'Buenos Aires',
    role: 'student',
    isActive: true,
    hobbies: ['código', 'música'],
  }
}

// User state object - single profile we read/write from the UI.
let user = createDefaultUser()

// Read form values - gather inputs into a plain object (still not validated).
function readFormValues() {
  return {
    name: nameInput.value.trim(),
    age: Number(ageInput.value),
    email: emailInput.value.trim(),
    city: cityInput.value.trim(),
    role: roleSelect.value,
    isActive: activeSelect.value === 'true',
  }
}

// Validate profile fields - name/email/city required; age must be a real number.
function validateProfile(data) {
  if (data.name.length === 0) {
    return 'El nombre no puede estar vacío.'
  }
  if (typeof data.age !== 'number' || Number.isNaN(data.age) || data.age < 1) {
    return 'La edad debe ser un número válido.'
  }
  if (data.email.length === 0 || data.email.indexOf('@') === -1) {
    return 'Ingresá un email válido.'
  }
  if (data.city.length === 0) {
    return 'La ciudad no puede estar vacía.'
  }
  return null
}

// Apply profile fields - copy validated fields into the user object properties.
function applyProfileFields(data) {
  user.name = data.name
  user.age = data.age
  user.email = data.email
  user.city = data.city
  user.role = data.role
  user.isActive = data.isActive
}

// Add hobby - push a new string into user.hobbies if it is not empty/duplicate.
function addHobby(rawHobby) {
  const hobby = rawHobby.trim()
  if (hobby.length === 0) {
    return false
  }
  if (user.hobbies.indexOf(hobby) !== -1) {
    return false
  }
  user.hobbies.push(hobby)
  return true
}

// Remove hobby - delete one item from the hobbies array by index.
function removeHobby(index) {
  if (index < 0 || index >= user.hobbies.length) {
    return
  }
  user.hobbies.splice(index, 1)
}

// Sync form from object - fill inputs using dot access on user properties.
function syncFormFromUser() {
  nameInput.value = user.name
  ageInput.value = String(user.age)
  emailInput.value = user.email
  cityInput.value = user.city
  roleSelect.value = user.role
  activeSelect.value = user.isActive ? 'true' : 'false'
}

// Show / hide form error message.
function setFormError(message) {
  if (!message) {
    formError.hidden = true
    formError.textContent = ''
    return
  }
  formError.hidden = false
  formError.textContent = message
}

// Render hobby chips - one removable button per hobbies array item.
function renderHobbies() {
  hobbyChips.innerHTML = ''
  for (let i = 0; i < user.hobbies.length; i++) {
    const hobby = user.hobbies[i]
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'chip'
    button.textContent = hobby + ' ×'
    button.title = 'Quitar hobby'
    button.addEventListener('click', function onRemoveHobby() {
      removeHobby(i)
      renderAll()
    })
    hobbyChips.appendChild(button)
  }
}

// Render profile card - uses object property access and a ternary for status.
function renderCard() {
  const roleLabel = ROLE_LABELS[user.role] || user.role
  const statusText = user.isActive ? 'Activo' : 'Inactivo'
  const hobbiesText = user.hobbies.length > 0 ? user.hobbies.join(', ') : '(sin hobbies)'

  cardEl.innerHTML =
    '<p class="name">' + user.name + '</p>' +
    '<p class="meta">' + user['email'] + '</p>' +
    '<p class="meta">' + user.city + ' · ' + user.age + ' años</p>' +
    '<p class="meta">Hobbies: ' + hobbiesText + '</p>' +
    '<span class="badge">' + roleLabel + ' · ' + statusText + '</span>'
}

// Render object view - show the user object as formatted JSON text.
function renderObjectView() {
  objectViewEl.textContent = JSON.stringify(user, null, 2)
}

// Render all preview sections from current user object.
function renderAll() {
  renderHobbies()
  renderCard()
  renderObjectView()
}

// Save handler - validate form, write into user object, re-render.
saveBtn.addEventListener('click', function onSave() {
  const data = readFormValues()
  const error = validateProfile(data)
  if (error) {
    setFormError(error)
    return
  }
  setFormError(null)
  applyProfileFields(data)
  renderAll()
})

// Hobby add handler - append to user.hobbies array.
hobbyAddBtn.addEventListener('click', function onAddHobby() {
  const ok = addHobby(hobbyInput.value)
  if (!ok) {
    setFormError('Hobby vacío o repetido.')
    return
  }
  setFormError(null)
  hobbyInput.value = ''
  renderAll()
})

// Reset handler - replace user with a new default object and sync the form.
resetBtn.addEventListener('click', function onReset() {
  user = createDefaultUser()
  syncFormFromUser()
  setFormError(null)
  hobbyInput.value = ''
  renderAll()
})

// Boot - paint UI from the initial user object.
syncFormFromUser()
renderAll()
