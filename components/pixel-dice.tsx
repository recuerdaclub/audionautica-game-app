'use client'

import { useEffect, useRef, useState } from 'react'

type PixelDiceProps = {
  // 'idle' = giro lento en espera, 'rolling' = giro rápido cambiando números, 'landed' = valor fijo
  mode: 'idle' | 'rolling' | 'landed'
  value: string | null
  size?: number
}

const CODES = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']

export function PixelDice({ mode, value, size = 200 }: PixelDiceProps) {
  const [display, setDisplay] = useState<string>(value ?? 'C?')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (mode === 'rolling') {
      intervalRef.current = setInterval(() => {
        setDisplay(CODES[Math.floor(Math.random() * CODES.length)])
      }, 70)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (mode === 'landed' && value) setDisplay(value)
      if (mode === 'idle') setDisplay('C?')
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [mode, value])

  const spin =
    mode === 'rolling'
      ? 'dice-spin 0.5s linear infinite'
      : mode === 'idle'
        ? 'dice-spin 6s linear infinite'
        : 'none'

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      aria-live="polite"
    >
      {/* halo */}
      <div
        className="absolute inset-0 neon-glow"
        style={{ animation: mode === 'landed' ? 'none' : undefined }}
      />
      <div
        className="relative flex h-full w-full items-center justify-center border-4 border-primary bg-card"
        style={{ animation: spin }}
      >
        {/* corner brackets */}
        <span className="absolute left-1 top-1 h-4 w-4 border-l-2 border-t-2 border-primary" />
        <span className="absolute right-1 top-1 h-4 w-4 border-r-2 border-t-2 border-primary" />
        <span className="absolute bottom-1 left-1 h-4 w-4 border-b-2 border-l-2 border-primary" />
        <span className="absolute bottom-1 right-1 h-4 w-4 border-b-2 border-r-2 border-primary" />

        <span
          className="font-pixel neon-text select-none"
          style={{ fontSize: size * 0.28 }}
        >
          {display}
        </span>
      </div>
    </div>
  )
}
