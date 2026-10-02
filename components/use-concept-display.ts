'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  displayConcept,
  ensureBilingual,
  migrateConcept,
  type ConceptEntry,
} from '@/lib/concepts'
import { useI18n } from '@/lib/i18n/context'

export function useConceptDisplay(entry: ConceptEntry | string): string {
  const { locale } = useI18n()
  const normalized = useMemo(() => migrateConcept(entry), [entry])
  const [text, setText] = useState(() =>
    normalized ? displayConcept(normalized, locale) : typeof entry === 'string' ? entry : '',
  )

  useEffect(() => {
    if (!normalized) {
      setText(typeof entry === 'string' ? entry : '')
      return
    }
    setText(displayConcept(normalized, locale))
    let cancelled = false
    void ensureBilingual(normalized).then((fixed) => {
      if (!cancelled) setText(displayConcept(fixed, locale))
    })
    return () => {
      cancelled = true
    }
  }, [normalized, locale, entry])

  return text
}
