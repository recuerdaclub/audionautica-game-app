'use client'

import { Volume2, VolumeX } from 'lucide-react'

type SoundToggleProps = {
  on: boolean
  onToggle: () => void
}

export function SoundToggle({ on, onToggle }: SoundToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? 'Silenciar audio' : 'Activar audio'}
      className="flex items-center gap-1.5 border-2 border-border px-2 py-1 font-sans text-sm text-foreground transition-colors hover:bg-accent"
    >
      {on ? (
        <Volume2 className="size-4" aria-hidden="true" />
      ) : (
        <VolumeX className="size-4 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{on ? 'SND:ON' : 'SND:OFF'}</span>
    </button>
  )
}
