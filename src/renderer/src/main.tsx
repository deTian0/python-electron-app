import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MessageForm from './components/MessageForm'

import Calculator from './components/Calculator';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MessageForm />
    <Calculator />
  </StrictMode>
)
