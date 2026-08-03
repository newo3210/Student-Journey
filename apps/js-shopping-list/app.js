//Mariano Montini ('bosque', 'bosquestudio')

// DOM references - form, list, filters, summary and action buttons.
const nameInput = document.getElementById('name-input')
const qtyInput = document.getElementById('qty-input')
const addBtn = document.getElementById('add-btn')
const formError = document.getElementById('form-error')
const listEl = document.getElementById('list')
const summaryEl = document.getElementById('summary')
const clearDoneBtn = document.getElementById('clear-done-btn')
const resetBtn = document.getElementById('reset-btn')
const filterButtons = document.querySelectorAll('.filter')

// List state - array of item objects + active filter string.
let items = []
let currentFilter = 'all'
let nextId = 1

// Seed items - starter products so the list is not empty on first load.
function createSeedItems() {
  return [
    { id: nextId++, name: 'leche', qty: 2, done: false },
    { id: nextId++, name: 'pan', qty: 1, done: false },
    { id: nextId++, name: 'huevos', qty: 12, done: true },
  ]
}

// Validate new item - name required; qty must be a positive number.
function validateNewItem(name, qty) {
  if (name.length === 0) {
    return 'Escribí el nombre del producto.'
  }
  if (typeof qty !== 'number' || Number.isNaN(qty) || qty < 1) {
    return 'La cantidad debe ser un número mayor o igual a 1.'
  }
  return null
}

// Add item - push a new object into the items array.
function addItem(name, qty) {
  const item = {
    id: nextId++,
    name: name,
    qty: qty,
    done: false,
  }
  items.push(item)
}

// Find index by id - walk the array and return the matching index (or -1).
function findIndexById(id) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      return i
    }
  }
  return -1
}

// Toggle done - flip done boolean for one item using its index.
function toggleDone(id) {
  const index = findIndexById(id)
  if (index === -1) {
    return
  }
  items[index].done = !items[index].done
}

// Remove item - delete one element from the array with splice.
function removeItem(id) {
  const index = findIndexById(id)
  if (index === -1) {
    return
  }
  items.splice(index, 1)
}

// Clear purchased - rebuild array keeping only pending items.
function clearDoneItems() {
  const pending = []
  for (let i = 0; i < items.length; i++) {
    if (!items[i].done) {
      pending.push(items[i])
    }
  }
  items = pending
}

// Filter items - return a new array according to all/pending/done.
function getVisibleItems() {
  const visible = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (currentFilter === 'all') {
      visible.push(item)
    } else if (currentFilter === 'pending' && item.done === false) {
      visible.push(item)
    } else if (currentFilter === 'done' && item.done === true) {
      visible.push(item)
    }
  }
  return visible
}

// Count helpers - total, pending and done amounts for the summary line.
function countDone() {
  let count = 0
  for (let i = 0; i < items.length; i++) {
    if (items[i].done) {
      count = count + 1
    }
  }
  return count
}

// Error UI - show or hide validation message.
function setFormError(message) {
  if (!message) {
    formError.hidden = true
    formError.textContent = ''
    return
  }
  formError.hidden = false
  formError.textContent = message
}

// Render summary - totals using operators and a ternary for plural text.
function renderSummary() {
  const total = items.length
  const done = countDone()
  const pending = total - done
  const label = total === 1 ? 'ítem' : 'ítems'
  summaryEl.textContent =
    total + ' ' + label + ' · ' + pending + ' pendientes · ' + done + ' compradas'
}

// Render filter buttons - mark the active filter visually.
function renderFilters() {
  for (let i = 0; i < filterButtons.length; i++) {
    const button = filterButtons[i]
    const isActive = button.getAttribute('data-filter') === currentFilter
    button.className = isActive ? 'filter is-on' : 'filter'
  }
}

// Render list - create one <li> per visible item with toggle/remove actions.
function renderList() {
  listEl.innerHTML = ''
  const visible = getVisibleItems()

  if (visible.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'empty'
    empty.textContent = 'No hay productos en este filtro.'
    listEl.appendChild(empty)
    return
  }

  for (let i = 0; i < visible.length; i++) {
    const item = visible[i]
    const li = document.createElement('li')
    li.className = 'item' + (item.done ? ' is-done' : '')

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = item.done
    checkbox.addEventListener('change', function onToggle() {
      toggleDone(item.id)
      renderAll()
    })

    const nameEl = document.createElement('span')
    nameEl.className = 'item-name'
    nameEl.textContent = item.name

    const qtyEl = document.createElement('span')
    qtyEl.className = 'item-qty'
    qtyEl.textContent = 'x' + item.qty

    const removeBtn = document.createElement('button')
    removeBtn.type = 'button'
    removeBtn.className = 'danger'
    removeBtn.textContent = 'Borrar'
    removeBtn.addEventListener('click', function onRemove() {
      removeItem(item.id)
      renderAll()
    })

    li.appendChild(checkbox)
    li.appendChild(nameEl)
    li.appendChild(qtyEl)
    li.appendChild(removeBtn)
    listEl.appendChild(li)
  }
}

// Render all - refresh filters, summary and list from current array state.
function renderAll() {
  renderFilters()
  renderSummary()
  renderList()
}

// Add button handler - validate inputs then push into items.
addBtn.addEventListener('click', function onAdd() {
  const name = nameInput.value.trim()
  const qty = Number(qtyInput.value)
  const error = validateNewItem(name, qty)
  if (error) {
    setFormError(error)
    return
  }
  setFormError(null)
  addItem(name, qty)
  nameInput.value = ''
  qtyInput.value = '1'
  nameInput.focus()
  renderAll()
})

// Enter key on name field - same as clicking Agregar.
nameInput.addEventListener('keydown', function onNameKey(event) {
  if (event.key === 'Enter') {
    addBtn.click()
  }
})

// Filter buttons - set currentFilter string and re-render.
for (let i = 0; i < filterButtons.length; i++) {
  filterButtons[i].addEventListener('click', function onFilterClick() {
    currentFilter = filterButtons[i].getAttribute('data-filter')
    renderAll()
  })
}

// Clear done handler - remove purchased items from the array.
clearDoneBtn.addEventListener('click', function onClearDone() {
  clearDoneItems()
  renderAll()
})

// Reset handler - replace list with seed items.
resetBtn.addEventListener('click', function onReset() {
  nextId = 1
  items = createSeedItems()
  currentFilter = 'all'
  setFormError(null)
  renderAll()
})

// Boot - start with seed data and paint the UI.
items = createSeedItems()
renderAll()
