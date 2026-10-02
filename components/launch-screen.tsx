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
        className="flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-between gap-4 overflow-y-auto px-5 py-6 text-center focus:outline-none"
      >
        <div className="flex w-full max-w-5xl flex-col gap-3">
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

        <div className="flex flex-col items-center gap-5">
          <PixelDice mode={diceMode} value={landed} size={190} />
          <p className="font-pixel neon-text min-h-[2.5rem] text-sm leading-relaxed text-balance sm:text-base lg:text-xl">
            {prompts[step]}
            {step < 3 && <span className="blink">_</span>}
          </p>
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
    <div className="flex items-center gap-4 border-2 border-border bg-card/50 px-4 py-4 text-left sm:px-6 lg:py-6">
      <span className="shrink-0 font-sans text-lg text-muted-foreground lg:text-2xl">
        {label}
      </span>
      <span className="mx-1 h-8 w-px shrink-0 bg-border" />
      {revealed ? (
        <span
          key={word}
          className="font-pixel neon-text break-words text-2xl leading-relaxed sm:text-4xl lg:text-5xl"
          style={{ animation: 'reveal-in 0.45s ease-out both' }}
        >
          {word}
        </span>
      ) : (
        <span className="font-pixel text-2xl tracking-widest text-muted-foreground sm:text-4xl">
          ▓▓▓▓▓▓
        </span>
      )}
    </div>
  )
}
