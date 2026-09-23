'use client'

import { useEffect, useState } from 'react'
import { ScreenFrame } from './screen-frame'
import { SoundToggle } from './sound-toggle'

const BOOT_LINES = [
  'AUDIONAUTICA BIOS v8.0 ...... OK',
  'CARGANDO NUCLEO DE CONCIENCIA .. OK',
  'MAPEANDO 8 CIRCUITOS .......... OK',
  'CALIBRANDO DADO CUANTICO ...... OK',
  'ENLACE NEURONAL ............... OK',
  'SISTEMA LISTO.',
]

type IntroScreenProps = {
  onNewGame: () => void
  onHistory: () => void
  hasHistory: boolean
  savedConcepts: number
  onLand: () => void
  soundOn: boolean
  onToggleSound: () => void
}

export function IntroScreen({
  onNewGame,
  onHistory,
  hasHistory,
  savedConcepts,
  onLand,
  soundOn,
  onToggleSound,
}: IntroScreenProps) {
  const [lines, setLines] = useState<number>(0)
  const [landArmed, setLandArmed] = useState(false)

  useEffect(() => {
    if (lines >= BOOT_LINES.length) return
    const t = setTimeout(() => setLines((n) => n + 1), 260)
    return () => clearTimeout(t)
  }, [lines])

  const booted = lines >= BOOT_LINES.length

  return (
    <ScreenFrame
      title="AUDIONÁUTICA"
      statusLeft="SYS://boot"
      statusRight={booted ? 'READY' : 'BOOTING...'}
      headerRight={<SoundToggle on={soundOn} onToggle={onToggleSound} />}
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-5 py-8">
        <div className="w-full max-w-xl">
          <h1 className="font-pixel neon-text flicker text-center text-2xl leading-relaxed text-balance sm:text-4xl">
            AUDIONÁUTICA
          </h1>
          <p className="mt-3 text-center text-lg text-muted-foreground text-pretty">
            {'>'} consola de navegación por los 8 circuitos de conciencia
          </p>
        </div>

        {/* Boot log */}
        <div className="w-full max-w-md border-2 border-border bg-card/60 p-3 font-sans text-base">
          {BOOT_LINES.slice(0, lines).map((l, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-primary">{'>'}</span>
              <span
                className={
                  l === 'SISTEMA LISTO.'
                    ? 'amber-text'
                    : 'text-foreground/90'
                }
              >
                {l}
              </span>
            </div>
          ))}
          {!booted && <span className="blink text-primary">█</span>}
        </div>

        {/* Actions */}
        <div
          className={`flex w-full max-w-md flex-col gap-3 transition-opacity duration-500 ${
            booted ? 'opacity-100' : 'pointer-events-none opacity-30'
          }`}
        >
          <button
            type="button"
            onClick={onNewGame}
            className="neon-glow group w-full border-2 border-primary bg-primary/10 px-5 py-4 font-pixel text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:text-base"
          >
            {savedConcepts > 0
              ? `> SEGUIR · ${savedConcepts} CONCEPTOS GUARDADOS`
              : '> INICIAR NUEVA PARTIDA'}
          </button>
          {savedConcepts > 0 && (
            <p className="text-center font-sans text-base text-muted-foreground">
              Siguen en este computador si se reinicia la página.
            </p>
          )}
          <button
            type="button"
            onClick={onHistory}
            disabled={!hasHistory}
            className="w-full border-2 border-border px-5 py-3 font-sans text-lg text-foreground transition-colors hover:enabled:bg-accent disabled:opacity-40"
          >
            [ REGISTRO DE SESIONES ]{' '}
            {!hasHistory && (
              <span className="text-sm text-muted-foreground">// vacío</span>
            )}
          </button>
          {savedConcepts > 0 && (
            <button
              type="button"
              onClick={() => {
                if (!landArmed) {
                  setLandArmed(true)
                  return
                }
                onLand()
              }}
              className="w-full border-2 border-amber px-5 py-3 font-sans text-lg transition-colors hover:bg-amber/10"
              style={{ color: 'var(--amber)' }}
            >
              {landArmed
                ? '[ CONFIRMAR ATERRIZAJE ]'
                : '[ ATERRIZAR Y FINALIZAR ]'}
            </button>
          )}
        </div>
      </div>
    </ScreenFrame>
  )
}
