import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles.css'
import { getRouterBasename } from './config/routerBase'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={getRouterBasename(import.meta.env.BASE_URL)}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
