'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ScreenFrame } from './screen-frame'
import { SoundToggle } from './sound-toggle'
import { UniverseMap } from './universe-map'
import { circuitForLocale } from '@/lib/circuits-locale'
import { useI18n } from '@/lib/i18n/context'
import type { ConceptEntry } from '@/lib/concepts'
import { useConceptDisplay } from './use-concept-display'
import type { Journey } from '@/lib/storage'

type FrameProps = {
  soundOn: boolean
  onToggleSound: () => void
  pilotName: string
  roomId: string
}

type MapScreenProps = FrameProps & {
  journey: Journey
  roundNumber: number
  remaining: number
  lowWords: boolean
  canContinue: boolean
  onAgain: () => void
  onAddWords: () => void
  onHome: () => void
  onLand: () => void
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
  pilotName,
  roomId,
}: MapScreenProps) {
  const { locale, tr } = useI18n()
  const circuit = circuitForLocale(journey.circuit, locale)
  const displayWord1 = useConceptDisplay(journey.word1)
  const displayWord2 = useConceptDisplay(journey.word2)
  const [landArmed, setLandArmed] = useState(false)

  return (
    <ScreenFrame
      title={tr('appTitle')}
      statusLeft="SYS://mapa-universo-digital"
      statusRight={`RONDA ${roundNumber} · ${remaining} REST.`}
      onTitleClick={onHome}
      pilotName={pilotName}
      roomId={roomId}
      headerRight={<SoundToggle on={soundOn} onToggle={onToggleSound} />}
    >
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {/* Conceptos arriba — móvil y PC */}
        <div className="grid shrink-0 grid-cols-1 gap-2 border-b-2 border-border p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:gap-5 lg:p-6">
          <ConceptCard label={tr('concept01')} entry={journey.word1} priority />
          <ConceptCard label={tr('concept02')} entry={journey.word2} priority />
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="relative min-h-[28dvh] flex-1 border-b-2 border-border lg:min-h-0 lg:border-b-0 lg:border-r-2">
            <UniverseMap
              activeCircuit={journey.circuit}
              circuitLabel={circuit?.short ?? journey.circuit}
              word1={displayWord1}
              word2={displayWord2}
            />
          </div>

          <aside className="flex min-h-0 w-full shrink-0 flex-col gap-3 overflow-y-auto p-4 sm:p-5 lg:h-full lg:w-[min(42%,520px)] lg:gap-4 lg:p-6">
            <div className="shrink-0">
              <p className="font-sans text-base tracking-[0.18em] text-muted-foreground sm:text-xl lg:text-2xl">
                {tr('mapActive')}
              </p>
              <p className="font-pixel neon-text mt-1 text-[clamp(3rem,12vw,5rem)] leading-none lg:text-[clamp(3.5rem,8vw,6rem)]">
                {journey.circuit}
              </p>
              <p className="amber-text mt-2 font-pixel text-[clamp(1rem,3.5vw,1.75rem)] leading-snug text-balance lg:text-[clamp(1.15rem,2.1vw,2.35rem)]">
                {circuit?.short}
              </p>
              {circuit?.plain && (
                <p className="mt-3 font-sans text-base leading-snug text-muted-foreground text-pretty sm:text-lg">
                  {circuit.plain}
                </p>
              )}
            </div>

            {lowWords && (
            <div className="flex shrink-0 items-start gap-2 border-2 border-destructive bg-destructive/10 px-3 py-2">
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <p className="font-sans text-lg text-destructive">
                {tr('mapLow', { n: remaining })}
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
                {tr('mapAgain')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddWords}
                className="neon-glow flex-1 border-2 border-amber bg-amber/10 px-4 py-3 font-pixel text-xs transition-colors lg:text-sm"
                style={{ color: 'var(--amber)' }}
              >
                {tr('mapReenter')}
              </button>
            )}
            <button
              type="button"
              onClick={onAddWords}
              className="border-2 border-border px-4 py-3 font-sans text-lg text-foreground transition-colors hover:bg-accent"
            >
              {tr('mapAdd')}
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
              {landArmed ? tr('mapLandConfirm') : tr('mapLand')}
            </button>
          </div>
        </aside>
        </div>
      </div>
    </ScreenFrame>
  )
}

function ConceptCard({
  label,
  entry,
  priority = false,
}: {
  label: string
  entry: ConceptEntry
  priority?: boolean
}) {
  const word = useConceptDisplay(entry)
  return (
    <div
      className={`flex min-h-0 flex-col border-2 border-border bg-card/50 px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5 ${
        priority
          ? 'min-h-[6.5rem] sm:min-h-[8rem] lg:min-h-[11rem] xl:min-h-[12.5rem]'
          : 'h-full'
      }`}
    >
      <span className="shrink-0 font-sans text-xs tracking-widest text-muted-foreground sm:text-sm lg:text-base">
        {label}
      </span>
      <FitText text={word} large={priority} />
    </div>
  )
}

function FitText({ text, large = false }: { text: string; large?: boolean }) {
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

      let lo = large ? 40 : 36
      let hi = Math.max(
        large ? 56 : 48,
        Math.min(width * 0.95, height * 0.94, large ? 520 : 240),
      )
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
  }, [text, large])

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
