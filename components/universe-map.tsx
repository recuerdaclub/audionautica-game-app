'use client'

import { useEffect, useRef } from 'react'

const NEON = '#5cff9d'
const NEON_DIM = '#1f7a45'
const AMBER = '#ffcf4d'
const BG = '#04180d'

type UniverseMapProps = {
  activeCircuit: string // C1..C8
  circuitLabel: string
  word1: string
  word2: string
}

type Star = { x: number; y: number; r: number; tw: number }

export function UniverseMap({
  activeCircuit,
  circuitLabel,
  word1,
  word2,
}: UniverseMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pixelFamily =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--font-pixel')
        .trim() || 'monospace'

    function resize() {
      const parent = canvas.parentElement
      if (!parent) return
      w = parent.clientWidth
      h = parent.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(900, Math.floor((w * h) / 7000))
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.85 ? 1.5 : 2.5,
        tw: Math.random() * Math.PI * 2,
      }))
    }

    function fontAt(size: number) {
      ctx.font = `${Math.round(size)}px ${pixelFamily}, monospace`
    }

    function fitSize(text: string, maxWidth: number, start: number) {
      let size = start
      fontAt(size)
      while (size > 14 && ctx.measureText(text).width > maxWidth) {
        size -= 2
        fontAt(size)
      }
      return size
    }

    function pixelText(
      text: string,
      x: number,
      y: number,
      size: number,
      color: string,
      align: CanvasTextAlign = 'center',
    ) {
      fontAt(size)
      ctx.textAlign = align
      ctx.textBaseline = 'middle'
      ctx.shadowColor = color
      ctx.shadowBlur = Math.max(8, size * 0.22)
      ctx.fillStyle = color
      ctx.fillText(text, Math.round(x), Math.round(y))
      ctx.shadowBlur = 0
    }

    const activeN = Number(activeCircuit.replace('C', '')) || 1

    function draw(time: number) {
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, w, h)

      for (const s of starsRef.current) {
        const a = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(time / 600 + s.tw))
        ctx.fillStyle = `rgba(92,255,157,${a})`
        ctx.fillRect(s.x, s.y, s.r, s.r)
      }

      const short = Math.min(w, h)
      const cx = w / 2
      const cy = h / 2
      const margin = Math.max(72, short * 0.16)
      const radius = Math.max(80, Math.min(w, h) / 2 - margin)
      const rot = time / 18000

      ctx.strokeStyle = 'rgba(31,122,69,0.55)'
      ctx.lineWidth = Math.max(1.5, short * 0.003)
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (radius * i) / 3, 0, Math.PI * 2)
        ctx.stroke()
      }

      const nodes: { x: number; y: number; n: number }[] = []
      for (let i = 0; i < 8; i++) {
        const ang = rot + (i / 8) * Math.PI * 2 - Math.PI / 2
        nodes.push({
          x: cx + Math.cos(ang) * radius,
          y: cy + Math.sin(ang) * radius,
          n: i + 1,
        })
      }

      for (const node of nodes) {
        const isActive = node.n === activeN
        ctx.strokeStyle = isActive ? NEON : 'rgba(31,122,69,0.5)'
        ctx.lineWidth = isActive
          ? Math.max(3, short * 0.007)
          : Math.max(1.5, short * 0.003)
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(node.x, node.y)
        ctx.stroke()
      }

      const idleLabel = Math.max(18, short * 0.048)
      const activeLabel = Math.max(26, short * 0.072)

      for (const node of nodes) {
        const isActive = node.n === activeN
        const size = isActive
          ? Math.max(16, short * 0.038)
          : Math.max(10, short * 0.024)
        ctx.fillStyle = isActive ? NEON : NEON_DIM
        ctx.shadowColor = isActive ? NEON : 'transparent'
        ctx.shadowBlur = isActive ? 18 : 0
        ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size)
        ctx.shadowBlur = 0

        const dx = node.x - cx
        const dy = node.y - cy
        const len = Math.hypot(dx, dy) || 1
        const labelSize = isActive ? activeLabel : idleLabel
        const lx = node.x + (dx / len) * (size + labelSize * 0.72)
        const ly = node.y + (dy / len) * (size + labelSize * 0.72)
        pixelText(
          `C${node.n}`,
          lx,
          ly,
          labelSize,
          isActive ? NEON : NEON_DIM,
        )
      }

      const centerSize = Math.max(72, short * 0.22)
      const nameSize = fitSize(
        circuitLabel,
        radius * 1.35,
        Math.max(18, short * 0.05),
      )
      fontAt(nameSize)
      const nameWidth = ctx.measureText(circuitLabel).width
      const boxHalfW = Math.min(
        radius * 0.78,
        Math.max(centerSize * 0.95, nameWidth / 2 + 22),
      )
      const boxHalfH = centerSize * 0.78

      const pulse = 0.5 + 0.5 * Math.sin(time / 300)
      ctx.strokeStyle = NEON
      ctx.lineWidth = Math.max(3, short * 0.006)
      ctx.shadowColor = NEON
      ctx.shadowBlur = 22 * pulse + 8
      ctx.strokeRect(
        cx - boxHalfW,
        cy - boxHalfH,
        boxHalfW * 2,
        boxHalfH * 2,
      )
      ctx.shadowBlur = 0
      pixelText(activeCircuit, cx, cy - nameSize * 0.35, centerSize, NEON)
      pixelText(circuitLabel, cx, cy + centerSize * 0.42, nameSize, AMBER)

      const active = nodes.find((n) => n.n === activeN)
      if (active) {
        const mp = 0.45 + 0.55 * Math.abs(Math.sin(time / 350))
        ctx.strokeStyle = AMBER
        ctx.lineWidth = Math.max(3, short * 0.006)
        ctx.globalAlpha = mp
        ctx.shadowColor = AMBER
        ctx.shadowBlur = 16
        const cs = Math.max(22, short * 0.055)
        ctx.beginPath()
        ctx.moveTo(active.x - cs, active.y)
        ctx.lineTo(active.x + cs, active.y)
        ctx.moveTo(active.x, active.y - cs)
        ctx.lineTo(active.x, active.y + cs)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(active.x, active.y, cs, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    raf = requestAnimationFrame(draw)
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [activeCircuit, circuitLabel])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-label={`Mapa del universo digital. Usted está en el circuito ${activeCircuit}, ${circuitLabel}. Conceptos: ${word1} y ${word2}.`}
      role="img"
    />
  )
}
