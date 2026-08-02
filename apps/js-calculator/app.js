//Mariano Montini ('bosque', 'bosquestudio')

// DOM references - inputs, result label, error label, and operation buttons.
const inputA = document.getElementById('input-a')
const inputB = document.getElementById('input-b')
const resultEl = document.getElementById('result')
const errorEl = document.getElementById('error')
const opButtons = document.querySelectorAll('[data-op]')

// Operation names - allowed calculator actions as string constants.
const OP_ADD = 'add'
const OP_SUBTRACT = 'subtract'
const OP_MULTIPLY = 'multiply'
const OP_DIVIDE = 'divide'

// Core math functions - each takes two numbers and returns one number.
function add(a, b) {
  return a + b
}

function subtract(a, b) {
  return a - b
}

function multiply(a, b) {
  return a * b
}

function divide(a, b) {
  return a / b
}

// Operations map - object that links operation name -> function reference.
const operations = {
  [OP_ADD]: add,
  [OP_SUBTRACT]: subtract,
  [OP_MULTIPLY]: multiply,
  [OP_DIVIDE]: divide,
}

// Parse inputs - read both fields and convert them to numbers.
function readOperands() {
  const a = Number(inputA.value)
  const b = Number(inputB.value)
  return { a, b }
}

// Validation - check that both values are real numbers (not NaN / empty junk).
function areValidNumbers(a, b) {
  const aOk = typeof a === 'number' && !Number.isNaN(a)
  const bOk = typeof b === 'number' && !Number.isNaN(b)
  return aOk && bOk
}

// UI helpers - show result text or an error message (never both).
function showResult(value) {
  errorEl.hidden = true
  errorEl.textContent = ''
  resultEl.textContent = 'Resultado: ' + value
}

function showError(message) {
  resultEl.textContent = 'Resultado: —'
  errorEl.hidden = false
  errorEl.textContent = message
}

// Calculate - pick operation, guard divide-by-zero with ternary, then display.
function calculate(opName) {
  const { a, b } = readOperands()

  if (!areValidNumbers(a, b)) {
    showError('Ingresá dos números válidos.')
    return
  }

  // Divide-by-zero guard - ternary chooses error path vs normal division.
  const isDivideByZero = opName === OP_DIVIDE && b === 0
  if (isDivideByZero) {
    showError('No se puede dividir por cero.')
    return
  }

  const operationFn = operations[opName]
  const result = operationFn(a, b)

  // Pretty print - integers stay clean; decimals keep up to 6 places.
  const pretty = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(6)))
  showResult(pretty)
}

// Click wiring - each button reads data-op and runs calculate.
opButtons.forEach(function bindOpButton(button) {
  button.addEventListener('click', function onOpClick() {
    const opName = button.getAttribute('data-op')
    calculate(opName)
  })
})
