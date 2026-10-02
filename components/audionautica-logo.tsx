'use client'

import { cn } from '@/lib/utils'

const MARK = '/audionautica-mark-mask.png'

type AudionauticaLogoProps = {
  /** Ancho y alto en px */
  size?: number
  className?: string
  /** Texto alternativo; vacío = decorativo */
  label?: string
}

/** Marca Audionáutica: forma blanca del PNG recoloreada a verde neón, sin fondo. */
export function AudionauticaLogo({
  size = 56,
  className,
  label = '',
}: AudionauticaLogoProps) {
  const maskStyle = {
    width: size,
    height: size,
    WebkitMaskImage: `url(${MARK})`,
    maskImage: `url(${MARK})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain' as const,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat' as const,
    WebkitMaskPosition: 'center',
    maskPosition: 'center' as const,
  }

  return (
    <span
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={!label}
    >
      <span
        className="absolute inset-0 bg-primary opacity-90 blur-md"
        style={maskStyle}
        aria-hidden
      />
      <span
        className="relative block h-full w-full bg-primary"
        style={maskStyle}
      />
    </span>
  )
}

export function AudionauticaLogoMark({
  className,
  size = 'sm',
}: {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero'
}) {
  const px =
    size === 'xs'
      ? 22
      : size === 'sm'
        ? 28
        : size === 'md'
          ? 48
          : size === 'lg'
            ? 72
            : 120
  return <AudionauticaLogo size={px} className={className} />
}
