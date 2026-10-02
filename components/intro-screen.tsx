'use client'

import { useEffect, useState } from 'react'
import { ScreenFrame } from './screen-frame'
import { SoundToggle } from './sound-toggle'
import { useI18n } from '@/lib/i18n/context'

type IntroScreenProps = {
  onNewGame: () => void
  onHistory: () => void
  hasHistory: boolean
  savedConcepts: number
  onLand: () => void
  syncRevision: number
  soundOn: boolean
  onToggleSound: () => void
  pilotName: string
  roomId: string
}

export function IntroScreen({
  onNewGame,
  onHistory,
  hasHistory,
  savedConcepts,
  onLand,
  syncRevision,
  soundOn,
  onToggleSound,
  pilotName,
  roomId,
}: IntroScreenProps) {
  const { tr, boots } = useI18n()
  const [lines, setLines] = useState<number>(0)
  const [landArmed, setLandArmed] = useState(false)

  useEffect(() => {
    if (lines >= boots.length) return
    const t = setTimeout(() => setLines((n) => n + 1), 260)
    return () => clearTimeout(t)
  }, [lines, boots.length])

  const booted = lines >= boots.length
  const readyLabel = tr('boot5')

  return (
    <ScreenFrame
      title={tr('appTitle')}
      statusLeft="SYS://boot"
      statusRight={
        booted
          ? `${tr('statusReady')} · ${tr('syncLive', { n: syncRevision })}`
          : tr('statusBooting')
      }
      pilotName={pilotName}
      roomId={roomId}
      headerRight={<SoundToggle on={soundOn} onToggle={onToggleSound} />}
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-5 py-8">
        <div className="w-full max-w-xl">
          <h1 className="font-pixel neon-text flicker text-center text-2xl leading-relaxed text-balance sm:text-4xl">
            {tr('appTitle')}
          </h1>
          <p className="mt-3 text-center text-lg text-muted-foreground text-pretty">
            {tr('tagline')}
          </p>
        </div>

        <div className="w-full max-w-md border-2 border-border bg-card/60 p-3 font-sans text-base">
          {boots.slice(0, lines).map((l, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-primary">{'>'}</span>
              <span
                className={
                  l === readyLabel ? 'amber-text' : 'text-foreground/90'
                }
              >
                {l}
              </span>
            </div>
          ))}
          {!booted && <span className="blink text-primary">█</span>}
        </div>

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
              ? tr('continueSaved', { n: savedConcepts })
              : tr('startNew')}
          </button>
          {savedConcepts > 0 && (
            <p className="text-center font-sans text-base text-muted-foreground">
              {tr('savedHint')}
            </p>
          )}
          <button
            type="button"
            onClick={onHistory}
            disabled={!hasHistory}
            className="w-full border-2 border-border px-5 py-3 font-sans text-lg text-foreground transition-colors hover:enabled:bg-accent disabled:opacity-40"
          >
            {tr('sessionLog')}{' '}
            {!hasHistory && (
              <span className="text-sm text-muted-foreground">
                {tr('sessionEmpty')}
              </span>
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
              {landArmed ? tr('landConfirm') : tr('landArm')}
            </button>
          )}
        </div>
      </div>
    </ScreenFrame>
  )
}
