'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  loadRoomCookie,
  loadUsername,
  type AppLocale,
} from '@/lib/cookies'
import { I18nProvider } from '@/lib/i18n/context'
import { loadSoundPref, saveSoundPref } from '@/lib/storage'
import { Sound } from '@/lib/sound'
import { LoginScreen } from './login-screen'
import { AudionauticaApp } from './audionautica-app'

export function AppShell() {
  return (
    <I18nProvider>
      <AppShellInner />
    </I18nProvider>
  )
}

function AppShellInner() {
  const [username, setUsername] = useState<string | null>(null)
  const [roomId, setRoomId] = useState('main')
  const [checked, setChecked] = useState(false)
  const [soundOn, setSoundOn] = useState(true)

  useEffect(() => {
    setUsername(loadUsername())
    setRoomId(loadRoomCookie() ?? 'main')
    setSoundOn(loadSoundPref())
    setChecked(true)
  }, [])

  const toggleSound = useCallback(() => {
    Sound.unlock()
    setSoundOn((prev) => {
      const next = !prev
      saveSoundPref(next)
      if (next) Sound.confirm()
      return next
    })
  }, [])

  if (!checked) {
    return <div className="h-dvh bg-background" />
  }

  if (!username) {
    return (
      <LoginScreen
        defaultRoom={roomId}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onComplete={(name, room) => {
          setUsername(name)
          setRoomId(room)
        }}
      />
    )
  }

  return (
    <AudionauticaApp
      username={username}
      roomId={roomId}
      soundOn={soundOn}
      onToggleSound={toggleSound}
    />
  )
}

export type { AppLocale }
