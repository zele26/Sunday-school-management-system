import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// We use 'createRoot' directly since that is what we imported above
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </StrictMode>,
)