import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('React montou com sucesso')
} catch (e) {
  document.getElementById('root')!.innerHTML =
    `<p style="color:red;font-family:sans-serif">Erro: ${e instanceof Error ? e.message : String(e)}</p>`
}
