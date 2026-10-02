'use client'

import { useState } from 'react'
import { ScreenFrame } from './screen-frame'
import { LocaleToggle } from './locale-toggle'
import { SoundToggle } from './sound-toggle'
import { saveRoomCookie, saveUsername } from '@/lib/cookies'
import { useI18n } from '@/lib/i18n/context'
import { Sound } from '@/lib/sound'

type LoginScreenProps = {
  defaultRoom: string
  onComplete: (username: string, roomId: string) => void
  soundOn: boolean
  onToggleSound: () => void
}

export function LoginScreen({
  defaultRoom,
  onComplete,
  soundOn,
  onToggleSound,
}: LoginScreenProps) {
  const { tr } = useI18n()
  const [name, setName] = useState('')
  const [room, setRoom] = useState(defaultRoom)
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const ok = saveUsername(name)
    if (!ok) {
      setError(tr('loginErrorShort'))
      return
    }
    const roomId = room.trim() || 'main'
    saveRoomCookie(roomId)
    Sound.unlock()
    Sound.confirm()
    onComplete(name.trim(), roomId)
  }

  return (
    <ScreenFrame
      title={tr('appTitle')}
      statusLeft="SYS://ident"
      statusRight="AWAIT"
      showLocaleToggle={false}
      headerRight={
        <>
          <LocaleToggle />
          <SoundToggle on={soundOn} onToggle={onToggleSound} />
        </>
      }
    >
      <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col justify-center gap-6 px-5 py-8">
        <div>
          <h1 className="font-pixel neon-text text-lg sm:text-xl">
            {tr('loginTitle')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground text-pretty">
            {tr('loginHint')}
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="pilot-name"
              className="mb-1 block font-sans text-sm text-muted-foreground"
            >
              {tr('userLabel')}
            </label>
            <input
              id="pilot-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              autoComplete="nickname"
              autoCapitalize="words"
              maxLength={32}
              placeholder={tr('loginPlaceholder')}
              className="w-full border-2 border-primary bg-input px-3 py-3 font-sans text-lg text-foreground caret-primary placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="room-id"
              className="mb-1 block font-sans text-sm text-muted-foreground"
            >
              {tr('loginRoomLabel')}
            </label>
            <input
              id="room-id"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              autoComplete="off"
              maxLength={24}
              placeholder={tr('loginRoomPlaceholder')}
              className="w-full border-2 border-border bg-input px-3 py-3 font-sans text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              {tr('loginRoomHint')}
            </p>
          </div>

          {error && (
            <p className="font-sans text-base text-destructive" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="neon-glow border-2 border-primary bg-primary/10 px-5 py-4 font-pixel text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {tr('loginSubmit')}
          </button>
        </form>
      </div>
    </ScreenFrame>
  )
}
