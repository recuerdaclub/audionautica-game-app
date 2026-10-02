import { Redis } from '@upstash/redis'

let client: Redis | null | undefined

/** REST Redis (Upstash o Vercel KV / Storage integrado en el dashboard). */
export function getRedis(): Redis | null {
  if (client !== undefined) return client

  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? ''
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    ''

  if (!url || !token) {
    client = null
    return null
  }

  client = new Redis({ url, token })
  return client
}

export function redisConfigured(): boolean {
  return getRedis() !== null
}
