import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { initAudioGestureUnlock } from './lib/sound'
import './index.css'
import App from './App.tsx'

registerSW({ immediate: true })
initAudioGestureUnlock()

// Backward compatibility: Convert legacy hash routes (e.g., /#/reminders) to clean paths
if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.slice(1) || '/'
  window.history.replaceState(null, '', cleanPath)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
