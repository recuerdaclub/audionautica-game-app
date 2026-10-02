'use client'

import { Trash2 } from 'lucide-react'
import { ScreenFrame } from './screen-frame'
import { SoundToggle } from './sound-toggle'
import { circuitForLocale } from '@/lib/circuits-locale'
import { useI18n } from '@/lib/i18n/context'
import type { ConceptEntry } from '@/lib/concepts'
import { formatDate, type Session } from '@/lib/storage'
import { useConceptDisplay } from './use-concept-display'

type FrameProps = {
  soundOn: boolean
  onToggleSound: () => void
  pilotName: string
  roomId: string
}

type HistoryScreenProps = FrameProps & {
  sessions: Session[]
  onBack: () => void
  onClear: () => void
}

export function HistoryScreen({
  sessions,
  onBack,
  onClear,
  soundOn,
  onToggleSound,
  pilotName,
  roomId,
}: HistoryScreenProps) {
  const { locale, tr } = useI18n()
  const ordered = [...sessions].sort((a, b) => b.startedAt - a.startedAt)
  const totalJourneys = sessions.reduce((n, s) => n + s.journeys.length, 0)

  return (
    <ScreenFrame
      title={tr('appTitle')}
      statusLeft="SYS://registro-de-sesiones"
      statusRight={`${sessions.length} SES · ${totalJourneys}`}
      onTitleClick={onBack}
      pilotName={pilotName}
      roomId={roomId}
      headerRight={<SoundToggle on={soundOn} onToggle={onToggleSound} />}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-pixel neon-text text-base sm:text-lg">
            {tr('historyTitle')}
          </h2>
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 border-2 border-destructive px-2 py-1 font-sans text-base text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {tr('historyClear')}
            </button>
          )}
        </div>

        {ordered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center border-2 border-border">
            <p className="font-sans text-lg text-muted-foreground">
              {tr('historyEmpty')}
              <span className="blink">_</span>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto pb-2">
            {ordered.map((session, si) => (
              <section
                key={session.id}
                className="border-2 border-border bg-card/40"
              >
                <header className="flex items-center justify-between gap-2 border-b-2 border-border px-3 py-2">
                  <span className="font-pixel neon-text text-[10px] sm:text-xs">
                    {tr('historyGame', { n: ordered.length - si })}
                  </span>
                  <span className="font-sans text-base text-muted-foreground">
                    {formatDate(session.startedAt, locale)}
                  </span>
                </header>

                {session.journeys.length === 0 ? (
                  <p className="px-3 py-3 font-sans text-base text-muted-foreground">
                    {tr('historyNoRolls')}
                  </p>
                ) : (
                  <ol className="divide-y divide-border">
                    {session.journeys.map((j, ji) => {
                      const c = circuitForLocale(j.circuit, locale)
                      return (
                        <li
                          key={j.id}
                          className="flex items-center gap-3 px-3 py-2"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center border-2 border-primary font-pixel text-xs text-primary">
                            {j.circuit}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-sans text-lg text-foreground">
                              <HistoryConcept word={j.word1} />
                              <span className="mx-2 text-muted-foreground">
                                ×
                              </span>
                              <HistoryConcept word={j.word2} />
                            </p>
                            <p className="truncate font-sans text-sm text-muted-foreground">
                              #{ji + 1} · {c?.short}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </section>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onBack}
          className="mt-auto shrink-0 border-2 border-border px-5 py-3 font-sans text-lg text-foreground transition-colors hover:bg-accent"
        >
          {tr('back')}
        </button>
      </div>
    </ScreenFrame>
  )
}

function HistoryConcept({ word }: { word: ConceptEntry }) {
  const text = useConceptDisplay(word)
  return <span className="text-primary">{text}</span>
}
