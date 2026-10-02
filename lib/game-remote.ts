import type { RoomSnapshot } from '@/lib/server/game-store'

export async function fetchRoom(roomId: string): Promise<RoomSnapshot | null> {
  try {
    const res = await fetch(`/api/game/${encodeURIComponent(roomId)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as RoomSnapshot
  } catch {
    return null
  }
}

export async function pushRoom(
  roomId: string,
  expectedRevision: number,
  payload: Pick<RoomSnapshot, 'live' | 'bank' | 'sessions'>,
): Promise<RoomSnapshot | null> {
  try {
    const res = await fetch(`/api/game/${encodeURIComponent(roomId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedRevision, ...payload }),
    })
    const data = (await res.json()) as RoomSnapshot & { room?: RoomSnapshot }
    if (res.status === 409 && data.room) return data.room
    if (!res.ok) return null
    return data
  } catch {
    return null
  }
}
