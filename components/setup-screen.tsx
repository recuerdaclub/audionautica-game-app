'use client'

import { useRef, useState } from 'react'
import { ScreenFrame } from './screen-frame'
import { SoundToggle } from './sound-toggle'

type SetupScreenProps = {
  pool: string[]
  onAdd: (word: string) => boolean // devuelve false si ya existe
  onStart: () => void
  onBack: () => void
  mode: 'new' | 'add'
  soundOn: boolean
  onToggleSound: () => void
  playKey: () => void
  playConfirm: () => void
  playWarn: () => void
}

export function SetupScreen({
  pool,
  onAdd,
  onStart,
  onBack,
  mode,
  soundOn,
  onToggleSound,
  playKey,
  playConfirm,
  playWarn,
}: SetupScreenProps) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<string>('')
  const [addedThisSession, setAddedThisSession] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const count = pool.length
  const canStart = count >= 2

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const raw = value.trim()
    if (!raw) return
    const ok = onAdd(raw)
    if (ok) {
      setStatus(`> CONCEPTO REGISTRADO [#${(count + 1).toString().padStart(3, '0')}]`)
      setAddedThisSession((n) => n + 1)
      playConfirm()
    } else {
      setStatus('> ! CONCEPTO YA EXISTE EN EL NÚCLEO')
      playWarn()
    }
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <ScreenFrame
      title="AUDIONÁUTICA"
      statusLeft="SYS://ingreso-de-conceptos"
      statusRight={`POOL: ${count}`}
      onTitleClick={onBack}
      headerRight={<SoundToggle on={soundOn} onToggle={onToggleSound} />}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
        <div>
          <h2 className="font-pixel neon-text text-base sm:text-lg">
            {mode === 'new' ? '// INGRESO DE CONCEPTOS' : '// AGREGAR CONCEPTOS'}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground text-pretty">
            Cada participante escribe palabras o conceptos al azar y presiona
            AÑADIR. Los conceptos quedan{' '}
            <span className="text-primary">ocultos pero registrados</span> en el
            núcleo.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <label htmlFor="concepto" className="sr-only">
            Concepto
          </label>
          <div className="flex items-stretch gap-2">
            <div className="flex flex-1 items-center border-2 border-primary bg-input px-3">
              <span className="mr-2 font-sans text-primary">{'>'}</span>
              <input
                id="concepto"
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  playKey()
                }}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="escribe un concepto..."
                className="w-full bg-transparent py-3 font-sans text-lg text-foreground caret-primary placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="neon-glow shrink-0 border-2 border-primary bg-primary/10 px-4 font-pixel text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              AÑADIR
            </button>
          </div>
          <p
            className="min-h-6 font-sans text-base amber-text"
            aria-live="polite"
          >
            {status}
          </p>
        </form>

        {/* Masked registry: nunca revela los conceptos */}
        <div className="flex-1 border-2 border-border bg-card/50 p-4">
          <div className="mb-3 flex items-center justify-between font-sans text-base text-muted-foreground">
            <span>NÚCLEO DE CONCEPTOS [OCULTO]</span>
            <span className="text-primary">{count} activos</span>
          </div>
          {count === 0 ? (
            <p className="font-sans text-lg text-muted-foreground">
              {'>'} sin conceptos aún<span className="blink">_</span>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: count }).map((_, i) => (
                <span
                  key={i}
                  className="border border-border bg-secondary px-2 py-1 font-sans text-base text-primary/80"
                  title="concepto oculto"
                >
                  ▓▓▓▓ #{(i + 1).toString().padStart(2, '0')}
                </span>
              ))}
            </div>
          )}
          {addedThisSession > 0 && (
            <p className="mt-3 font-sans text-sm text-muted-foreground">
              + {addedThisSession} agregado(s) en esta ronda de ingreso
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              if (!canStart) {
                playWarn()
                setStatus('> ! SE NECESITAN AL MENOS 2 CONCEPTOS')
                return
              }
              onStart()
            }}
            className={`flex-1 border-2 px-5 py-4 font-pixel text-xs transition-colors sm:text-sm ${
              canStart
                ? 'neon-glow border-primary bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                : 'border-border text-muted-foreground'
            }`}
          >
            {mode === 'new'
              ? '> INICIAR EL JUEGO'
              : '> VOLVER AL JUEGO'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="border-2 border-border px-5 py-3 font-sans text-lg text-foreground transition-colors hover:bg-accent"
          >
            [ VOLVER ]
          </button>
        </div>
      </div>
    </ScreenFrame>
  )
}
