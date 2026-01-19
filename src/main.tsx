import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Tailwind
import './i18n' // I18n init
// registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
