//Mariano Montini ('bosque', 'bosquestudio')
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Root element - DOM node where the React tree is mounted.
const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root not found')
}

// App bootstrap - render the task manager under StrictMode.
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
