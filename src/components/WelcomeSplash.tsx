import { useEffect, useState } from 'react'
import { useLoginTransitionStore } from '@/stores/loginTransitionStore'
import './WelcomeSplash.css'

export function WelcomeSplash() {
  const setShowWelcome = useLoginTransitionStore((s) => s.setShowWelcome)
  // Phase: 'enter' → 'visible' → 'exit'
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter')

  useEffect(() => {
    // Logo scale-in
    const t1 = setTimeout(() => setPhase('visible'), 100)
    // Mulai fade-out setelah 2.6 detik
    const t2 = setTimeout(() => setPhase('exit'), 2600)
    // Hapus splash setelah animasi exit selesai (0.6s)
    const t3 = setTimeout(() => setShowWelcome(false), 3200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [setShowWelcome])

  return (
    <div className={`ws-overlay ws-overlay--${phase}`}>
      <div className={`ws-card ws-card--${phase}`}>
        <div className="ws-logo-wrap">
          <img
            src="/logo-cipicung.webp"
            alt="Logo Cipicung"
            className="ws-logo"
          />
          <div className="ws-ring ws-ring--1" />
          <div className="ws-ring ws-ring--2" />
        </div>

        <h1 className="ws-title">Selamat Datang di</h1>
        <p className="ws-brand">SeHati</p>

        <div className="ws-dots">
          <span className="ws-dot ws-dot--1" />
          <span className="ws-dot ws-dot--2" />
          <span className="ws-dot ws-dot--3" />
        </div>
      </div>
    </div>
  )
}
