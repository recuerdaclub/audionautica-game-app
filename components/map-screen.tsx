'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ScreenFrame } from './screen-frame'
import { SoundToggle } from './sound-toggle'
import { UniverseMap } from './universe-map'
import { circuitByCode } from '@/lib/circuits'
import type { Journey } from '@/lib/storage'

type MapScreenProps = {
  journey: Journey
  roundNumber: number
  remaining: number
  lowWords: boolean
  canContinue: boolean
  onAgain: () => void
  onAddWords: () => void
  onHome: () => void
  onLand: () => void
  soundOn: boolean
  onToggleSound: () => void
}

export function MapScreen({
  journey,
  roundNumber,
  remaining,
  lowWords,
  canContinue,
  onAgain,
  onAddWords,
  onHome,
  onLand,
  soundOn,
  onToggleSound,
}: MapScreenProps) {
  const circuit = circuitByCode(journey.circuit)
  const [landArmed, setLandArmed] = useState(false)

  return (
    <ScreenFrame
      title="AUDIONÁUTICA"
      statusLeft="SYS://mapa-universo-digital"
      statusRight={`RONDA ${roundNumber} · ${remaining} REST.`}
      onTitleClick={onHome}
      headerRight={<SoundToggle on={soundOn} onToggle={onToggleSound} />}
    >
      <div className="flex h-full min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[38dvh] flex-1 border-b-2 border-border lg:min-h-0 lg:border-b-0 lg:border-r-2">
          <UniverseMap
            activeCircuit={journey.circuit}
            circuitLabel={circuit?.short ?? journey.circuit}
            word1={journey.word1}
            word2={journey.word2}
          />
        </div>

        <aside className="flex min-h-0 w-full shrink-0 flex-col gap-3 overflow-hidden p-4 sm:p-5 lg:h-full lg:w-1/2 lg:gap-4 lg:p-6">
          <div className="shrink-0">
            <p className="font-sans text-xl tracking-[0.18em] text-muted-foreground lg:text-2xl">
              CIRCUITO ACTIVO
            </p>
            <p className="font-pixel neon-text mt-1 text-[clamp(4.5rem,9vw,9.5rem)] leading-none">
              {journey.circuit}
            </p>
            <p className="amber-text mt-2 font-pixel text-[clamp(1.15rem,2.1vw,2.35rem)] leading-snug text-balance">
              {circuit?.short}
            </p>
          </div>

          <div className="grid h-full min-h-0 flex-1 grid-rows-2 gap-3">
            <ConceptCard label="CONCEPTO 01" word={journey.word1} />
            <ConceptCard label="CONCEPTO 02" word={journey.word2} />
          </div>

          {lowWords && (
            <div className="flex shrink-0 items-start gap-2 border-2 border-destructive bg-destructive/10 px-3 py-2">
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <p className="font-sans text-lg text-destructive">
                Quedan {remaining} conceptos en el núcleo.
              </p>
            </div>
          )}

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {canContinue ? (
              <button
                type="button"
                onClick={onAgain}
                className="neon-glow flex-1 border-2 border-primary bg-primary/10 px-4 py-3 font-pixel text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground lg:text-sm"
              >
                {'>'} LANZAR DE NUEVO
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddWords}
                className="neon-glow flex-1 border-2 border-amber bg-amber/10 px-4 py-3 font-pixel text-xs transition-colors lg:text-sm"
                style={{ color: 'var(--amber)' }}
              >
                {'>'} REINGRESAR CONCEPTOS
              </button>
            )}
            <button
              type="button"
              onClick={onAddWords}
              className="border-2 border-border px-4 py-3 font-sans text-lg text-foreground transition-colors hover:bg-accent"
            >
              [ AGREGAR ]
            </button>
            <button
              type="button"
              onClick={() => {
                if (!landArmed) {
                  setLandArmed(true)
                  return
                }
                onLand()
              }}
              className="border-2 border-amber px-4 py-3 font-sans text-lg transition-colors hover:bg-amber/10"
              style={{ color: 'var(--amber)' }}
            >
              {landArmed ? '[ CONFIRMAR ]' : '[ ATERRIZAR ]'}
            </button>
          </div>
        </aside>
      </div>
    </ScreenFrame>
  )
}

function ConceptCard({ label, word }: { label: string; word: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col border-2 border-border bg-card/50 px-4 py-3 lg:px-5 lg:py-4">
      <span className="shrink-0 font-sans text-lg tracking-widest text-muted-foreground lg:text-2xl">
        {label}
      </span>
      <FitText text={word} />
    </div>
  )
}

function FitText({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(64)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return

    const fit = () => {
      const width = box.clientWidth
      const height = box.clientHeight
      if (width < 8 || height < 8) return

      const probe = document.createElement('span')
      const style = getComputedStyle(box)
      probe.style.position = 'absolute'
      probe.style.visibility = 'hidden'
      probe.style.pointerEvents = 'none'
      probe.style.fontFamily = style.fontFamily
      probe.style.fontWeight = '400'
      probe.style.lineHeight = '0.95'
      probe.style.letterSpacing = '0.02em'
      probe.style.textTransform = 'uppercase'
      probe.style.whiteSpace = 'normal'
      probe.style.wordBreak = 'break-word'
      probe.style.width = `${width}px`
      probe.textContent = text
      box.appendChild(probe)

      let lo = 36
      let hi = Math.max(48, Math.min(width * 0.9, height * 0.92, 240))
      while (hi - lo > 1) {
        const mid = (lo + hi) / 2
        probe.style.fontSize = `${mid}px`
        const fits =
          probe.scrollHeight <= height + 1 && probe.scrollWidth <= width + 2
        if (fits) lo = mid
        else hi = mid
      }
      probe.remove()
      setSize(Math.floor(lo))
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
  }, [text])

  return (
    <div
      ref={boxRef}
      className="font-sans neon-text mt-1 flex min-h-0 flex-1 items-center uppercase"
    >
      <p
        className="w-full break-words"
        style={{ fontSize: size, lineHeight: 0.95 }}
      >
        {text}
      </p>
    </div>
  )
}
