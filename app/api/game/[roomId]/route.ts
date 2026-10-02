import { NextResponse } from 'next/server'
import { getRoom, putRoom, storageBackend } from '@/lib/server/game-store'
import type { LiveState, Session } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PutBody = {
  expectedRevision: number
  live: LiveState | null
  bank: string[]
  sessions: Session[]
}

function sanitizeRoomId(raw: string): string {
  const id = raw.trim().slice(0, 24)
  return /^[a-zA-Z0-9_-]+$/.test(id) ? id : 'main'
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await context.params
  const room = await getRoom(sanitizeRoomId(roomId))
  return NextResponse.json(room, {
    headers: { 'X-Audionautica-Storage': storageBackend() },
  })
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await context.params
  const id = sanitizeRoomId(roomId)
  let body: PutBody
  try {
    body = (await request.json()) as PutBody
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (
    typeof body.expectedRevision !== 'number' ||
    !Array.isArray(body.bank) ||
    !Array.isArray(body.sessions)
  ) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const result = await putRoom(
    id,
    {
      live: body.live ?? null,
      bank: body.bank.filter((w) => typeof w === 'string'),
      sessions: body.sessions,
    },
    body.expectedRevision,
  )

  const headers = { 'X-Audionautica-Storage': storageBackend() }

  if (!result.ok) {
    return NextResponse.json(
      { conflict: true, room: result.room },
      { status: 409, headers },
    )
  }

  return NextResponse.json(result.room, { headers })
}
