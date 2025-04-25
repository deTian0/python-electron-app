import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Calculator from './components/Calculator';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Calculator />
  </StrictMode>
)
