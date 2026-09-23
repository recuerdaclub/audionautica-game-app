'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { IntroScreen } from './intro-screen'
import { SetupScreen } from './setup-screen'
import { LaunchScreen } from './launch-screen'
import { MapScreen } from './map-screen'
import { HistoryScreen } from './history-screen'
import { Sound } from '@/lib/sound'
import {
  loadBank,
  loadLive,
  loadSessions,
  loadSoundPref,
  mergeBank,
  saveBank,
  saveLive,
  saveSessions,
  saveSoundPref,
  uid,
  type Journey,
  type Session,
} from '@/lib/storage'

type Screen = 'intro' | 'setup' | 'launch' | 'map' | 'history'

const LOW_WORDS_THRESHOLD = 4

export function AudionauticaApp() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [setupMode, setSetupMode] = useState<'new' | 'add'>('new')
  const [pool, setPool] = useState<string[]>([])
  const [bank, setBank] = useState<string[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [round, setRound] = useState<{ word1: string; word2: string } | null>(
    null,
  )
  const [lastJourney, setLastJourney] = useState<Journey | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const [loaded, setLoaded] = useState(false)

  // cargar estado persistido. Si el navegador recarga, se retoma
  // la misma pantalla, conceptos y circuito.
  useEffect(() => {
    const live = loadLive()
    const remembered = mergeBank(loadBank(), live)
    setSessions(loadSessions())
    setSoundOn(loadSoundPref())
    setBank(remembered)
    saveBank(remembered)
    if (live) {
      setScreen(live.screen)
      setSetupMode(live.setupMode)
      setPool(live.pool)
      setCurrentSession(live.currentSession)
      setRound(live.round)
      setLastJourney(live.lastJourney)
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    saveLive({
      screen,
      setupMode,
      pool,
      currentSession,
      round,
      lastJourney,
    })
    saveBank(bank)
  }, [loaded, screen, setupMode, pool, currentSession, round, lastJourney, bank])

  // helpers de sonido respetando la preferencia
  const s = useMemo(() => {
    const guard =
      (fn: () => void) =>
      () => {
        if (soundOn) fn()
      }
    return {
      boot: guard(Sound.boot),
      key: guard(Sound.key),
      confirm: guard(Sound.confirm),
      back: guard(Sound.back),
      reveal: guard(Sound.reveal),
      warn: guard(Sound.warn),
      diceRoll: guard(Sound.diceRoll),
      diceLand: guard(Sound.diceLand),
    }
  }, [soundOn])

  const toggleSound = useCallback(() => {
    Sound.unlock()
    setSoundOn((prev) => {
      const next = !prev
      saveSoundPref(next)
      if (next) Sound.confirm()
      return next
    })
  }, [])

  const remaining = pool.length
  const lowWords = remaining > 0 && remaining <= LOW_WORDS_THRESHOLD
  const canContinue = remaining >= 2

  // Deduplicar (case-insensitive)
  const addWord = useCallback(
    (word: string) => {
      const clean = word.trim().replace(/\s+/g, ' ')
      if (!clean) return false
      let added = false
      setPool((prev) => {
        const exists = prev.some(
          (w) => w.toLowerCase() === clean.toLowerCase(),
        )
        if (exists) return prev
        added = true
        return [...prev, clean]
      })
      setBank((prev) => {
        const exists = prev.some(
          (w) => w.toLowerCase() === clean.toLowerCase(),
        )
        if (exists) return prev
        return [...prev, clean]
      })
      return added
    },
    [],
  )

  // Selecciona 2 conceptos al azar y los saca del núcleo.
  // La selección se calcula con el valor actual de `pool` y se guarda
  // con un array plano (no un updater que re-randomiza), de modo que
  // la doble invocación de React StrictMode sea idempotente.
  const startRound = useCallback(() => {
    if (pool.length < 2) return false
    const idx = new Set<number>()
    while (idx.size < 2) idx.add(Math.floor(Math.random() * pool.length))
    const [i1, i2] = [...idx]
    const word1 = pool[i1]
    const word2 = pool[i2]
    setRound({ word1, word2 })
    setPool(pool.filter((_, i) => i !== i1 && i !== i2))
    setScreen('launch')
    return true
  }, [pool])

  const newGame = useCallback(() => {
    Sound.unlock()
    s.boot()
    setPool(bank)
    setRound(null)
    setLastJourney(null)
    setCurrentSession({ id: uid(), startedAt: Date.now(), journeys: [] })
    setSetupMode('new')
    setScreen('setup')
  }, [s, bank])

  const landAndFinish = useCallback(() => {
    s.confirm()
    setBank([])
    saveBank([])
    setPool([])
    setRound(null)
    setLastJourney(null)
    setCurrentSession(null)
    setSetupMode('new')
    setScreen('intro')
  }, [s])

  const openAddWords = useCallback(() => {
    s.back()
    setSetupMode('add')
    setScreen('setup')
  }, [s])

  const goHome = useCallback(() => {
    s.back()
    setScreen('intro')
  }, [s])

  const onSetupStart = useCallback(() => {
    s.confirm()
    startRound()
  }, [s, startRound])

  const onSetupBack = useCallback(() => {
    s.back()
    if (setupMode === 'add' && lastJourney) {
      setScreen('map')
    } else {
      setScreen('intro')
    }
  }, [s, setupMode, lastJourney])

  // Registrar el viaje al aterrizar el dado
  const onLaunchComplete = useCallback(
    (circuit: string) => {
      if (!round) return
      const journey: Journey = {
        id: uid(),
        at: Date.now(),
        word1: round.word1,
        word2: round.word2,
        circuit,
      }
      const base =
        currentSession ?? {
          id: uid(),
          startedAt: Date.now(),
          journeys: [] as Journey[],
        }
      const updatedSession: Session = {
        ...base,
        journeys: [...base.journeys, journey],
      }
      setCurrentSession(updatedSession)
      setSessions((list) => {
        const exists = list.some((x) => x.id === updatedSession.id)
        const next = exists
          ? list.map((x) => (x.id === updatedSession.id ? updatedSession : x))
          : [...list, updatedSession]
        saveSessions(next)
        return next
      })
      setLastJourney(journey)
      setScreen('map')
    },
    [round, currentSession],
  )

  const onAgain = useCallback(() => {
    s.confirm()
    if (canContinue) {
      startRound()
    } else {
      openAddWords()
    }
  }, [s, canContinue, startRound, openAddWords])

  const clearHistory = useCallback(() => {
    s.warn()
    setSessions([])
    saveSessions([])
  }, [s])

  const roundNumber = currentSession?.journeys.length ?? 0

  if (!loaded) {
    return <div className="h-dvh bg-background" />
  }

  if (screen === 'intro') {
    return (
      <IntroScreen
        onNewGame={newGame}
        onHistory={() => {
          s.confirm()
          setScreen('history')
        }}
        hasHistory={sessions.length > 0}
        savedConcepts={bank.length}
        onLand={landAndFinish}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />
    )
  }

  if (screen === 'setup') {
    return (
      <SetupScreen
        pool={pool}
        onAdd={addWord}
        onStart={onSetupStart}
        onBack={onSetupBack}
        mode={setupMode}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        playKey={s.key}
        playConfirm={s.confirm}
        playWarn={s.warn}
      />
    )
  }

  if (screen === 'launch' && round) {
    return (
      <LaunchScreen
        word1={round.word1}
        word2={round.word2}
        remaining={remaining}
        lowWords={lowWords}
        onComplete={onLaunchComplete}
        onAddWords={openAddWords}
        onHome={goHome}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        playReveal={s.reveal}
        playDiceRoll={s.diceRoll}
        playDiceLand={s.diceLand}
      />
    )
  }

  if (screen === 'map' && lastJourney) {
    return (
      <MapScreen
        journey={lastJourney}
        roundNumber={roundNumber}
        remaining={remaining}
        lowWords={lowWords}
        canContinue={canContinue}
        onAgain={onAgain}
        onAddWords={openAddWords}
        onHome={goHome}
        onLand={landAndFinish}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />
    )
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        sessions={sessions}
        onBack={goHome}
        onClear={clearHistory}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />
    )
  }

  // fallback
  return (
    <IntroScreen
      onNewGame={newGame}
      onHistory={() => setScreen('history')}
      hasHistory={sessions.length > 0}
      savedConcepts={bank.length}
      onLand={landAndFinish}
      soundOn={soundOn}
      onToggleSound={toggleSound}
    />
  )
}
