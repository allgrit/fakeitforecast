import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { App } from './App'
import './styles.css'
import { getRouterBasename, shouldUseHashRouter } from './config/routerBase'

const baseUrl = import.meta.env.BASE_URL
const basename = getRouterBasename(baseUrl)
const Router = shouldUseHashRouter(baseUrl) ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router basename={basename}>
      <App />
    </Router>
  </React.StrictMode>
)
