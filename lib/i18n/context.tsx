'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  loadLocaleCookie,
  saveLocaleCookie,
  type AppLocale,
} from '@/lib/cookies'
import { bootLines, t, type MessageKey } from '@/lib/i18n/messages'

type I18nContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  tr: (key: MessageKey, vars?: Record<string, string | number>) => string
  boots: string[]
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('es')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = loadLocaleCookie()
    if (saved) {
      setLocaleState(saved)
      setReady(true)
      return
    }
    fetch('/api/locale', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { locale?: AppLocale }) => {
        if (data.locale === 'en' || data.locale === 'es') {
          setLocaleState(data.locale)
        }
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next)
    saveLocaleCookie(next)
    document.documentElement.lang = next
  }, [])

  useEffect(() => {
    if (ready) document.documentElement.lang = locale
  }, [locale, ready])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      tr: (key, vars) => t(locale, key, vars),
      boots: bootLines(locale),
    }),
    [locale, setLocale],
  )

  if (!ready) {
    return <div className="h-dvh bg-background" />
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
