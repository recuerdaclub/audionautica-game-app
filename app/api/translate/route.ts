import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type AppLocale = 'es' | 'en'

async function myMemory(
  text: string,
  from: AppLocale,
  to: AppLocale,
): Promise<string | null> {
  const url = new URL('https://api.mymemory.translated.net/get')
  url.searchParams.set('q', text.slice(0, 500))
  url.searchParams.set('langpair', `${from}|${to}`)

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) return null
  const data = (await res.json()) as {
    responseData?: { translatedText?: string }
  }
  const out = data.responseData?.translatedText?.trim()
  if (!out || out.toUpperCase() === text.toUpperCase()) return out ?? null
  return out
}

export async function POST(req: Request) {
  let body: { text?: string; source?: string }
  try {
    body = (await req.json()) as { text?: string; source?: string }
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const text = String(body.text ?? '').trim().replace(/\s+/g, ' ').slice(0, 120)
  if (!text) {
    return NextResponse.json({ error: 'empty' }, { status: 400 })
  }

  const source: AppLocale = body.source === 'en' ? 'en' : 'es'
  const target: AppLocale = source === 'es' ? 'en' : 'es'

  const translated = (await myMemory(text, source, target)) ?? text

  return NextResponse.json({
    es: source === 'es' ? text : translated,
    en: source === 'en' ? text : translated,
  })
}
