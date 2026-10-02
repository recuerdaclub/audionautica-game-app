'use client'

import { Languages } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import type { AppLocale } from '@/lib/cookies'

export function LocaleToggle() {
  const { locale, setLocale, tr } = useI18n()

  function cycle() {
    const next: AppLocale = locale === 'es' ? 'en' : 'es'
    setLocale(next)
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="flex items-center gap-1 border-2 border-border px-2 py-1 font-sans text-xs text-foreground transition-colors hover:bg-accent"
      aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a español'}
      title={locale === 'es' ? 'English' : 'Español'}
    >
      <Languages className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{locale === 'es' ? tr('langEn') : tr('langEs')}</span>
    </button>
  )
}
