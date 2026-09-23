'use client'

import { useEffect, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export function FullscreenButton() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  async function toggle() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // el navegador puede rechazar pantalla completa sin gesto válido
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      className="flex items-center gap-1.5 border-2 border-primary bg-primary/10 px-2 py-1 font-sans text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {active ? (
        <Minimize2 className="size-4" aria-hidden="true" />
      ) : (
        <Maximize2 className="size-4" aria-hidden="true" />
      )}
      <span>{active ? 'VENTANA' : 'PANTALLA COMPLETA'}</span>
    </button>
  )
}
