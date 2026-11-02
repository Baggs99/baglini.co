import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './wap.css'
import { Storefront } from './Storefront.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Storefront />
  </StrictMode>,
)
