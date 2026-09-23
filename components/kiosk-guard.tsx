'use client'

import { useEffect } from 'react'

/**
 * Mantiene la pantalla despierta y la página compilada mientras la
 * consola queda abierta durante horas. No navega ni recarga.
 */
export function KioskGuard() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    let stopped = false

    async function acquire() {
      if (stopped || !('wakeLock' in navigator)) return
      try {
        lock = await navigator.wakeLock.request('screen')
      } catch {
        lock = null
      }
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)

    // Mantiene viva la entrada del servidor local para que no recompile
    // y dispare un refresh después de un rato sin peticiones.
    const ping = window.setInterval(() => {
      fetch(window.location.href, {
        method: 'HEAD',
        cache: 'no-store',
      }).catch(() => {})
    }, 3 * 60 * 1000)

    return () => {
      stopped = true
      window.clearInterval(ping)
      document.removeEventListener('visibilitychange', onVisibility)
      lock?.release().catch(() => {})
    }
  }, [])

  return null
}
