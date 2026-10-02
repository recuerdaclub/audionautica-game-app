// Persistencia local (localStorage) del registro de sesiones de juego.

import {
  migrateConcept,
  migrateConceptList,
  type ConceptEntry,
} from '@/lib/concepts'

export type { ConceptEntry } from '@/lib/concepts'

export type Journey = {
  id: string
  at: number
  word1: ConceptEntry
  word2: ConceptEntry
  circuit: string // C1..C8
}

export type Session = {
  id: string
  startedAt: number
  journeys: Journey[]
}

const SESSIONS_KEY = 'audionautica.sessions.v1'
const SOUND_KEY = 'audionautica.sound.v1'
const LIVE_KEY = 'audionautica.live.v1'
const BANK_KEY = 'audionautica.bank.v1'

const SCREENS = ['intro', 'setup', 'launch', 'map', 'history'] as const

export type LiveScreen = (typeof SCREENS)[number]

export type LiveState = {
  screen: LiveScreen
  setupMode: 'new' | 'add'
  pool: ConceptEntry[]
  currentSession: Session | null
  round: { word1: ConceptEntry; word2: ConceptEntry } | null
  lastJourney: Journey | null
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function loadSessions(): Session[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Session[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((session) => ({
      ...session,
      journeys: (session.journeys ?? [])
        .map((j) => {
          const w1 = migrateConcept(j.word1)
          const w2 = migrateConcept(j.word2)
          if (!w1 || !w2) return null
          return { ...j, word1: w1, word2: w2 }
        })
        .filter((j): j is Journey => j != null),
    }))
  } catch {
    return []
  }
}

export function saveSessions(sessions: Session[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch {
    // ignore quota errors
  }
}

export function loadSoundPref(): boolean {
  if (typeof window === 'undefined') return true
  const raw = window.localStorage.getItem(SOUND_KEY)
  return raw === null ? true : raw === '1'
}

export function saveSoundPref(on: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SOUND_KEY, on ? '1' : '0')
}

export function loadLive(): LiveState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LIVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LiveState
    if (!parsed || !SCREENS.includes(parsed.screen)) return null
    if (!Array.isArray(parsed.pool)) return null
    parsed.pool = migrateConceptList(parsed.pool)
    if (parsed.round) {
      const w1 = migrateConcept(parsed.round.word1)
      const w2 = migrateConcept(parsed.round.word2)
      if (!w1 || !w2) parsed.round = null
      else parsed.round = { word1: w1, word2: w2 }
    }
    if (parsed.lastJourney) {
      const w1 = migrateConcept(parsed.lastJourney.word1)
      const w2 = migrateConcept(parsed.lastJourney.word2)
      if (!w1 || !w2) parsed.lastJourney = null
      else parsed.lastJourney = { ...parsed.lastJourney, word1: w1, word2: w2 }
    }
    if (parsed.currentSession?.journeys) {
      parsed.currentSession.journeys = parsed.currentSession.journeys
        .map((j) => {
          const w1 = migrateConcept(j.word1)
          const w2 = migrateConcept(j.word2)
          if (!w1 || !w2) return null
          return { ...j, word1: w1, word2: w2 }
        })
        .filter((j): j is Journey => j != null)
    }
    if (parsed.setupMode !== 'new' && parsed.setupMode !== 'add') return null
    return parsed
  } catch {
    return null
  }
}

export function saveLive(state: LiveState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LIVE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

export function loadBank(): ConceptEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BANK_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return migrateConceptList(parsed)
  } catch {
    return []
  }
}

export function saveBank(words: ConceptEntry[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BANK_KEY, JSON.stringify(words))
  } catch {
    // ignore quota errors
  }
}

function remember(list: ConceptEntry[], word: ConceptEntry | null | undefined) {
  if (!word) return
  const exists = list.some(
    (c) =>
      c.es.toLowerCase() === word.es.toLowerCase() ||
      c.en.toLowerCase() === word.en.toLowerCase(),
  )
  if (!exists) list.push(word)
}

/** Lista completa de conceptos de este viaje, aunque ya se hayan lanzado. */
export function mergeBank(stored: ConceptEntry[], live: LiveState | null): ConceptEntry[] {
  const words = [...stored]
  if (!live) return words
  for (const word of live.pool) remember(words, word)
  remember(words, live.round?.word1)
  remember(words, live.round?.word2)
  for (const journey of live.currentSession?.journeys ?? []) {
    remember(words, journey.word1)
    remember(words, journey.word2)
  }
  remember(words, live.lastJourney?.word1)
  remember(words, live.lastJourney?.word2)
  return words
}

export function formatDate(
  ts: number,
  locale: 'es' | 'en' = 'es',
): string {
  try {
    return new Date(ts).toLocaleString(locale === 'en' ? 'en-US' : 'es', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(ts)
  }
}
