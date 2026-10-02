'use client'

import type { ReactNode } from 'react'
import { FullscreenButton } from './fullscreen-button'
import { KioskGuard } from './kiosk-guard'
import { LocaleToggle } from './locale-toggle'

type ScreenFrameProps = {
  title: string
  statusLeft?: string
  statusRight?: string
  pilotName?: string
  roomId?: string
  children: ReactNode
  onTitleClick?: () => void
  headerRight?: ReactNode
  showLocaleToggle?: boolean
}

export function ScreenFrame({
  title,
  statusLeft,
  statusRight,
  children,
  onTitleClick,
  headerRight,
  pilotName,
  roomId,
  showLocaleToggle = true,
}: ScreenFrameProps) {
  return (
    <div className="crt-scanlines crt-vignette pixel-grid relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-background">
      <KioskGuard />
      {/* Header bar */}
      <header className="relative z-30 flex shrink-0 items-center justify-between gap-3 border-b-2 border-border px-3 py-2 sm:px-5 sm:py-3">
        <button
          type="button"
          onClick={onTitleClick}
          className="font-pixel text-[10px] leading-tight neon-text tracking-tight sm:text-xs"
        >
          {title}
        </button>
        <div className="flex items-center gap-2">
          {pilotName && (
            <span className="hidden max-w-[8rem] truncate font-sans text-[10px] text-muted-foreground sm:inline">
              {pilotName}
              {roomId ? ` · ${roomId}` : ''}
            </span>
          )}
          <FullscreenButton />
          {showLocaleToggle && <LocaleToggle />}
          {headerRight}
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-20 flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>

      {/* Status footer */}
      <footer className="relative z-30 flex shrink-0 items-center justify-between gap-2 border-t-2 border-border px-3 py-1.5 font-sans text-sm text-muted-foreground sm:px-5">
        <span className="truncate">
          {statusLeft ?? 'SYS://audionautica'}
          <span className="blink ml-1">_</span>
        </span>
        <span className="shrink-0 truncate">{statusRight ?? 'OK'}</span>
      </footer>
    </div>
  )
}
