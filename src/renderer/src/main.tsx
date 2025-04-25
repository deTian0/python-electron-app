import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MessageForm from './components/MessageForm'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MessageForm />
  </StrictMode>
)
