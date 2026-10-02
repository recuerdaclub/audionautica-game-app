import type { LiveState, Session } from '@/lib/storage'
import { getRedis } from '@/lib/server/redis-client'

export type RoomSnapshot = {
  revision: number
  updatedAt: number
  live: LiveState | null
  bank: string[]
  sessions: Session[]
}

const KEY_PREFIX = 'audionautica:room:'
const rooms = new Map<string, RoomSnapshot>()

function roomKey(roomId: string): string {
  return KEY_PREFIX + (roomId.trim().slice(0, 24) || 'main')
}

export function emptyRoom(): RoomSnapshot {
  return {
    revision: 0,
    updatedAt: Date.now(),
    live: null,
    bank: [],
    sessions: [],
  }
}

function parseSnapshot(raw: unknown): RoomSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as RoomSnapshot
  if (typeof o.revision !== 'number') return null
  if (!Array.isArray(o.bank) || !Array.isArray(o.sessions)) return null
  return o
}

function getRoomMemory(roomId: string): RoomSnapshot {
  const key = roomId.trim().slice(0, 24) || 'main'
  let room = rooms.get(key)
  if (!room) {
    room = emptyRoom()
    rooms.set(key, room)
  }
  return room
}

function putRoomMemory(
  roomId: string,
  payload: Omit<RoomSnapshot, 'revision' | 'updatedAt'>,
  expectedRevision: number,
): { ok: true; room: RoomSnapshot } | { ok: false; room: RoomSnapshot } {
  const key = roomId.trim().slice(0, 24) || 'main'
  const current = getRoomMemory(key)
  if (expectedRevision !== current.revision) {
    return { ok: false, room: current }
  }
  const next: RoomSnapshot = {
    revision: current.revision + 1,
    updatedAt: Date.now(),
    live: payload.live,
    bank: payload.bank,
    sessions: payload.sessions,
  }
  rooms.set(key, next)
  return { ok: true, room: next }
}

async function getRoomRedis(roomId: string): Promise<RoomSnapshot> {
  const redis = getRedis()
  if (!redis) return getRoomMemory(roomId)

  const raw = await redis.get<RoomSnapshot>(roomKey(roomId))
  const parsed = parseSnapshot(raw)
  return parsed ?? emptyRoom()
}

async function putRoomRedis(
  roomId: string,
  payload: Omit<RoomSnapshot, 'revision' | 'updatedAt'>,
  expectedRevision: number,
): Promise<{ ok: true; room: RoomSnapshot } | { ok: false; room: RoomSnapshot }> {
  const redis = getRedis()
  if (!redis) return putRoomMemory(roomId, payload, expectedRevision)

  const key = roomKey(roomId)
  const current = await getRoomRedis(roomId)

  if (expectedRevision !== current.revision) {
    return { ok: false, room: current }
  }

  const next: RoomSnapshot = {
    revision: current.revision + 1,
    updatedAt: Date.now(),
    live: payload.live,
    bank: payload.bank,
    sessions: payload.sessions,
  }

  await redis.set(key, next)
  return { ok: true, room: next }
}

/** Lectura de sala: Redis en producción (Vercel), memoria en local sin variables. */
export async function getRoom(roomId: string): Promise<RoomSnapshot> {
  if (getRedis()) return getRoomRedis(roomId)
  return getRoomMemory(roomId)
}

export async function putRoom(
  roomId: string,
  payload: Omit<RoomSnapshot, 'revision' | 'updatedAt'>,
  expectedRevision: number,
): Promise<{ ok: true; room: RoomSnapshot } | { ok: false; room: RoomSnapshot }> {
  if (getRedis()) return putRoomRedis(roomId, payload, expectedRevision)
  return putRoomMemory(roomId, payload, expectedRevision)
}

export function storageBackend(): 'redis' | 'memory' {
  return getRedis() ? 'redis' : 'memory'
}
