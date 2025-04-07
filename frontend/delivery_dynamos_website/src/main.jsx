import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouteProvider } from './context/RouteContext'
import './index.css'
import App from './App.jsx'
import * as bootstrap from 'bootstrap'

createRoot(document.getElementById('root')).render(
  <RouteProvider>
    <App />
  </RouteProvider>,
)
