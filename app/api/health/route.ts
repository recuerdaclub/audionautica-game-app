import { NextResponse } from 'next/server'
import { redisConfigured } from '@/lib/server/redis-client'
import { storageBackend } from '@/lib/server/game-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Comprueba que la API ve Redis en producción (Vercel + KV/Upstash). */
export async function GET() {
  const backend = storageBackend()
  const ok = backend === 'redis' || process.env.NODE_ENV !== 'production'

  return NextResponse.json(
    {
      ok,
      storage: backend,
      redisConfigured: redisConfigured(),
      hint:
        backend === 'memory' && process.env.NODE_ENV === 'production'
          ? 'Conecta Upstash Redis o Vercel KV al proyecto y redeploy.'
          : undefined,
    },
    { status: ok ? 200 : 503 },
  )
}
