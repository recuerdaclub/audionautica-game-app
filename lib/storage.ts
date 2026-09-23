// Persistencia local (localStorage) del registro de sesiones de juego.

export type Journey = {
  id: string
  at: number
  word1: string
  word2: string
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
  pool: string[]
  currentSession: Session | null
  round: { word1: string; word2: string } | null
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
    return Array.isArray(parsed) ? parsed : []
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

export function loadBank(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BANK_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((w): w is string => typeof w === 'string' && w.trim().length > 0)
  } catch {
    return []
  }
}

export function saveBank(words: string[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BANK_KEY, JSON.stringify(words))
  } catch {
    // ignore quota errors
  }
}

function remember(list: string[], word: string | null | undefined) {
  const clean = word?.trim()
  if (!clean) return
  if (list.some((w) => w.toLowerCase() === clean.toLowerCase())) return
  list.push(clean)
}

/** Lista completa de conceptos de este viaje, aunque ya se hayan lanzado. */
export function mergeBank(stored: string[], live: LiveState | null): string[] {
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

export function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString('es', {
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
