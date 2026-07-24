import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'   // ✅ add this
import App from './App.jsx'
import './index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)