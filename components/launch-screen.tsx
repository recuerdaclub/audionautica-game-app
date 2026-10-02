'use client'

import { useCallback, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ScreenFrame } from './screen-frame'
import { SoundToggle } from './sound-toggle'
import { PixelDice } from './pixel-dice'
import { useI18n } from '@/lib/i18n/context'

type FrameProps = {
  soundOn: boolean
  onToggleSound: () => void
  pilotName: string
  roomId: string
}

type LaunchScreenProps = FrameProps & {
  word1: string
  word2: string
  remaining: number
  lowWords: boolean
  onComplete: (circuit: string) => void
  onAddWords: () => void
  onHome: () => void
  playReveal: () => void
  playDiceRoll: () => void
  playDiceLand: () => void
}

export function LaunchScreen({
  word1,
  word2,
  remaining,
  lowWords,
  onComplete,
  onAddWords,
  onHome,
  soundOn,
  onToggleSound,
  pilotName,
  roomId,
  playReveal,
  playDiceRoll,
  playDiceLand,
}: LaunchScreenProps) {
  const { tr } = useI18n()
  const [step, setStep] = useState(0)
  const [rolling, setRolling] = useState(false)
  const [landed, setLanded] = useState<string | null>(null)
  const busy = useRef(false)

  const prompts = [
    tr('launchReveal1'),
    tr('launchReveal2'),
    tr('launchDice'),
    tr('launchCalc'),
  ]

  const handleTap = useCallback(() => {
    if (busy.current) return
    if (step === 0) {
      setStep(1)
      playReveal()
    } else if (step === 1) {
      setStep(2)
      playReveal()
    } else if (step === 2) {
      busy.current = true
      setStep(3)
      setRolling(true)
      playDiceRoll()
      const circuit = `C${Math.floor(Math.random() * 8) + 1}`
      window.setTimeout(() => {
        setRolling(false)
        setLanded(circuit)
        playDiceLand()
        window.setTimeout(() => {
          onComplete(circuit)
        }, 1600)
      }, 1800)
    }
  }, [step, playReveal, playDiceRoll, playDiceLand, onComplete])

  const diceMode = rolling ? 'rolling' : landed ? 'landed' : 'idle'

  return (
    <ScreenFrame
      title={tr('appTitle')}
      statusLeft="SYS://lanzamiento"
      statusRight={`PALABRAS: ${remaining}`}
      onTitleClick={onHome}
      pilotName={pilotName}
      roomId={roomId}
      headerRight={<SoundToggle on={soundOn} onToggle={onToggleSound} />}
    >
      <button
        type="button"
        onClick={handleTap}
        aria-label="Tap to advance"
        className="flex min-h-0 flex-1 cursor-pointer flex-col items-stretch gap-4 overflow-y-auto px-4 py-4 text-center focus:outline-none sm:px-5 sm:py-5"
      >
        {/* Conceptos primero — móvil vertical y PC */}
        <div className="flex w-full shrink-0 flex-col gap-3 sm:gap-4">
          <WordSlot
            label={tr('concept01')}
            word={word1}
            revealed={step >= 1}
          />
          <WordSlot
            label={tr('concept02')}
            word={word2}
            revealed={step >= 2}
          />
        </div>

        <p className="font-pixel neon-text shrink-0 px-2 text-sm leading-relaxed text-balance sm:text-base lg:text-lg">
          {prompts[step]}
          {step < 3 && <span className="blink">_</span>}
        </p>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-2">
          <div className="sm:hidden">
            <PixelDice mode={diceMode} value={landed} size={150} />
          </div>
          <div className="hidden sm:block">
            <PixelDice mode={diceMode} value={landed} size={190} />
          </div>
        </div>

        {lowWords ? (
          <div
            onClick={(e) => {
              e.stopPropagation()
              onAddWords()
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                onAddWords()
              }
            }}
            className="flex items-center gap-2 border-2 border-destructive bg-destructive/10 px-4 py-2 font-sans text-base text-destructive-foreground"
          >
            <AlertTriangle
              className="size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <span className="text-destructive">
              {tr('launchLow', { n: remaining })}
            </span>
          </div>
        ) : (
          <div className="h-[2.75rem]" aria-hidden="true" />
        )}
      </button>
    </ScreenFrame>
  )
}

function WordSlot({
  label,
  word,
  revealed,
}: {
  label: string
  word: string
  revealed: boolean
}) {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-2 border-2 border-border bg-card/50 px-4 py-4 text-left sm:gap-3 sm:px-6 sm:py-5 lg:py-6">
      <span className="shrink-0 font-sans text-sm tracking-widest text-muted-foreground sm:text-base lg:text-lg">
        {label}
      </span>
      <div className="min-h-[3.25rem] sm:min-h-[4rem] lg:min-h-[5rem]">
        {revealed ? (
          <span
            key={word}
            className="font-pixel neon-text block break-words text-[clamp(2rem,9vw,3.25rem)] leading-tight sm:text-[clamp(2.25rem,6vw,4rem)] lg:text-[clamp(2.75rem,4.5vw,5rem)]"
            style={{ animation: 'reveal-in 0.45s ease-out both' }}
          >
            {word}
          </span>
        ) : (
          <span className="font-pixel block text-[clamp(2rem,9vw,3.25rem)] tracking-widest text-muted-foreground sm:text-[clamp(2.25rem,6vw,4rem)] lg:text-[clamp(2.75rem,4.5vw,5rem)]">
            ▓▓▓▓▓▓
          </span>
        )}
      </div>
    </div>
  )
}
