import type { AppLocale } from '@/lib/cookies'

function conceptId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export type ConceptEntry = {
  id: string
  es: string
  en: string
  source: AppLocale
}

export function migrateConcept(raw: unknown): ConceptEntry | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return null
    return { id: conceptId(), es: t, en: t, source: 'es' }
  }
  if (typeof raw === 'object') {
    const o = raw as Partial<ConceptEntry>
    const es = (typeof o.es === 'string' ? o.es : '').trim()
    const en = (typeof o.en === 'string' ? o.en : '').trim()
    if (!es && !en) return null
    return {
      id: typeof o.id === 'string' ? o.id : conceptId(),
      es: es || en,
      en: en || es,
      source: o.source === 'en' ? 'en' : 'es',
    }
  }
  return null
}

export function migrateConceptList(raw: unknown): ConceptEntry[] {
  if (!Array.isArray(raw)) return []
  const out: ConceptEntry[] = []
  for (const item of raw) {
    const c = migrateConcept(item)
    if (c) out.push(c)
  }
  return out
}

export function displayConcept(c: ConceptEntry, locale: AppLocale): string {
  return locale === 'en' ? c.en : c.es
}

export function sameConceptText(a: ConceptEntry, text: string): boolean {
  const t = text.trim().toLowerCase()
  return a.es.toLowerCase() === t || a.en.toLowerCase() === t
}

export function poolHasText(pool: ConceptEntry[], text: string): boolean {
  return pool.some((c) => sameConceptText(c, text))
}

export function needsBilingualFix(c: ConceptEntry): boolean {
  return c.es.trim().toLowerCase() === c.en.trim().toLowerCase()
}

export async function bilingualize(
  text: string,
  source: AppLocale,
): Promise<ConceptEntry> {
  const clean = text.trim().replace(/\s+/g, ' ')
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, source }),
    })
    if (res.ok) {
      const data = (await res.json()) as { es?: string; en?: string }
      return {
        id: conceptId(),
        es: (data.es ?? clean).trim() || clean,
        en: (data.en ?? clean).trim() || clean,
        source,
      }
    }
  } catch {
    // offline / API down
  }
  return { id: conceptId(), es: clean, en: clean, source }
}

export async function ensureBilingual(
  entry: ConceptEntry,
): Promise<ConceptEntry> {
  if (!needsBilingualFix(entry)) return entry
  const seed = entry.source === 'en' ? entry.en : entry.es
  return bilingualize(seed, entry.source)
}
