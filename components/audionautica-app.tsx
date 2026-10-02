'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IntroScreen } from './intro-screen'
import { SetupScreen } from './setup-screen'
import { LaunchScreen } from './launch-screen'
import { MapScreen } from './map-screen'
import { HistoryScreen } from './history-screen'
import { Sound } from '@/lib/sound'
import { fetchRoom, pushRoom } from '@/lib/game-remote'
import type { RoomSnapshot } from '@/lib/server/game-store'
import {
  loadBank,
  loadLive,
  loadSessions,
  mergeBank,
  saveBank,
  saveLive,
  saveSessions,
  uid,
  type Journey,
  type LiveState,
  type Session,
} from '@/lib/storage'

type Screen = 'intro' | 'setup' | 'launch' | 'map' | 'history'

const LOW_WORDS_THRESHOLD = 4

type AudionauticaAppProps = {
  username: string
  roomId: string
  soundOn: boolean
  onToggleSound: () => void
}

export function AudionauticaApp({
  username,
  roomId,
  soundOn,
  onToggleSound,
}: AudionauticaAppProps) {
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
  const [loaded, setLoaded] = useState(false)
  const [revision, setRevision] = useState(0)
  const revisionRef = useRef(0)
  const applyingRemote = useRef(false)

  const applySnapshot = useCallback((snap: RoomSnapshot) => {
    applyingRemote.current = true
    revisionRef.current = snap.revision
    setRevision(snap.revision)
    if (snap.live) {
      setScreen(snap.live.screen)
      setSetupMode(snap.live.setupMode)
      setPool(snap.live.pool)
      setCurrentSession(snap.live.currentSession)
      setRound(snap.live.round)
      setLastJourney(snap.live.lastJourney)
    }
    setBank(snap.bank)
    setSessions(snap.sessions)
    saveBank(snap.bank)
    saveSessions(snap.sessions)
    if (snap.live) saveLive(snap.live)
    queueMicrotask(() => {
      applyingRemote.current = false
    })
  }, [])

  const currentLive = useMemo(
    (): LiveState => ({
      screen,
      setupMode,
      pool,
      currentSession,
      round,
      lastJourney,
    }),
    [screen, setupMode, pool, currentSession, round, lastJourney],
  )

  useEffect(() => {
    revisionRef.current = revision
  }, [revision])

  useEffect(() => {
    const live = loadLive()
    const remembered = mergeBank(loadBank(), live)
    setSessions(loadSessions())
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

    fetchRoom(roomId).then((remote) => {
      if (!remote) {
        setLoaded(true)
        return
      }
      if (remote.revision > 0) {
        applySnapshot(remote)
      } else if (live || remembered.length > 0) {
        void pushRoom(roomId, 0, {
          live,
          bank: remembered,
          sessions: loadSessions(),
        }).then((created) => {
          if (created) {
            revisionRef.current = created.revision
            setRevision(created.revision)
          }
        })
      }
      setLoaded(true)
    })
  }, [roomId, applySnapshot])

  useEffect(() => {
    if (!loaded || applyingRemote.current) return
    saveLive(currentLive)
    saveBank(bank)
  }, [loaded, currentLive, bank])

  useEffect(() => {
    if (!loaded || applyingRemote.current) return
    const handle = window.setTimeout(() => {
      void pushRoom(roomId, revisionRef.current, {
        live: currentLive,
        bank,
        sessions,
      }).then((next) => {
        if (!next) return
        if (next.revision !== revisionRef.current) {
          revisionRef.current = next.revision
          setRevision(next.revision)
        }
      })
    }, 350)
    return () => window.clearTimeout(handle)
  }, [loaded, roomId, currentLive, bank, sessions])

  useEffect(() => {
    if (!loaded) return
    let cancelled = false
    const poll = window.setInterval(() => {
      void fetchRoom(roomId).then((remote) => {
        if (cancelled || !remote) return
        if (remote.revision > revisionRef.current) {
          applySnapshot(remote)
        }
      })
    }, 2000)
    return () => {
      cancelled = true
      window.clearInterval(poll)
    }
  }, [loaded, roomId, applySnapshot])

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

  const remaining = pool.length
  const lowWords = remaining > 0 && remaining <= LOW_WORDS_THRESHOLD
  const canContinue = remaining >= 2

  const addWord = useCallback((word: string) => {
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
  }, [])

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
  const frameExtras = {
    pilotName: username,
    roomId,
    soundOn,
    onToggleSound,
  }

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
        syncRevision={revision}
        {...frameExtras}
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
        playKey={s.key}
        playConfirm={s.confirm}
        playWarn={s.warn}
        {...frameExtras}
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
        playReveal={s.reveal}
        playDiceRoll={s.diceRoll}
        playDiceLand={s.diceLand}
        {...frameExtras}
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
        {...frameExtras}
      />
    )
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        sessions={sessions}
        onBack={goHome}
        onClear={clearHistory}
        {...frameExtras}
      />
    )
  }

  return (
    <IntroScreen
      onNewGame={newGame}
      onHistory={() => setScreen('history')}
      hasHistory={sessions.length > 0}
      savedConcepts={bank.length}
      onLand={landAndFinish}
      syncRevision={revision}
      {...frameExtras}
    />
  )
}
