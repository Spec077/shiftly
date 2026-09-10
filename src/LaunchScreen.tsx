import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import logo from './assets/logo.png'
import './LaunchScreen.css'

export default function LaunchScreen({ children }: { children: ReactNode }) {
  const [opening, setOpening] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setOpening(false), 1400)
    return () => window.clearTimeout(timer)
  }, [])

  if (!opening) return children

  return (
    <div className="launch-screen" role="status" aria-label="Opening Shiftly">
      <div className="launch-brand" aria-hidden="true">
        <img className="launch-logo" src={logo} alt="" width={112} height={112} fetchPriority="high" />
        <div className="launch-wordmark">Sh<span className="launch-i">ı<span /></span>ftly</div>
        <p>Paste. Convert. Copy.</p>
        <span className="launch-progress"><span /></span>
      </div>
    </div>
  )
}
