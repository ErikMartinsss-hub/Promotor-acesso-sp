import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

try {
  window.__debug?.('3. main.tsx iniciando')
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  window.__debug?.('4. React montou')
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e)
  window.__error?.(msg)
  document.getElementById('root')!.innerHTML =
    `<p class="dbg-err">Erro: ${msg}</p>`
}
