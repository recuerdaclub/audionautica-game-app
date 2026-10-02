const USER_COOKIE = 'audionautica.user'
const LOCALE_COOKIE = 'audionautica.locale'
const ROOM_COOKIE = 'audionautica.room'
const MAX_AGE_YEAR = 60 * 60 * 24 * 365

export type AppLocale = 'es' | 'en'

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  )
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name: string, value: string, maxAge = MAX_AGE_YEAR) {
  if (typeof document === 'undefined') return
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function loadUsername(): string | null {
  const raw = readCookie(USER_COOKIE)
  if (!raw) return null
  const trimmed = raw.trim().slice(0, 32)
  return trimmed.length >= 2 ? trimmed : null
}

export function saveUsername(name: string) {
  const clean = name.trim().slice(0, 32)
  if (clean.length < 2) return false
  writeCookie(USER_COOKIE, clean)
  return true
}

export function clearUsername() {
  deleteCookie(USER_COOKIE)
}

export function loadLocaleCookie(): AppLocale | null {
  const raw = readCookie(LOCALE_COOKIE)
  return raw === 'en' || raw === 'es' ? raw : null
}

export function saveLocaleCookie(locale: AppLocale) {
  writeCookie(LOCALE_COOKIE, locale)
}

export function loadRoomCookie(): string | null {
  const raw = readCookie(ROOM_COOKIE)
  if (!raw) return null
  const clean = raw.trim().slice(0, 24)
  return /^[a-zA-Z0-9_-]+$/.test(clean) ? clean : null
}

export function saveRoomCookie(roomId: string) {
  const clean = roomId.trim().slice(0, 24)
  if (!/^[a-zA-Z0-9_-]+$/.test(clean)) return false
  writeCookie(ROOM_COOKIE, clean)
  return true
}
