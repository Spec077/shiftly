import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LaunchScreen from './LaunchScreen'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LaunchScreen><App /></LaunchScreen>
  </StrictMode>,
)
