import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EN_COUNTRIES = new Set([
  'US',
  'GB',
  'CA',
  'AU',
  'NZ',
  'IE',
  'SG',
  'IN',
  'PH',
  'ZA',
])

export async function GET() {
  const h = await headers()
  const country =
    h.get('x-vercel-ip-country') ??
    h.get('cf-ipcountry') ??
    h.get('x-country-code') ??
    ''

  const accept = h.get('accept-language') ?? ''
  const prefersEn = accept.toLowerCase().startsWith('en')

  let locale: 'es' | 'en' = 'es'
  if (EN_COUNTRIES.has(country.toUpperCase()) || prefersEn) {
    locale = 'en'
  }

  return NextResponse.json({ locale, country: country || null })
}
