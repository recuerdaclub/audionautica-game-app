// Motor de sonido retro (BIOS beeps) usando Web Audio API. Sin archivos externos.

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

type Wave = OscillatorType

function beep(
  freq: number,
  duration: number,
  type: Wave = 'square',
  gainValue = 0.06,
  startAt = 0,
) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  const t = c.currentTime + startAt
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t)
  osc.stop(t + duration + 0.02)
}

export const Sound = {
  // Debe llamarse tras una interacción del usuario para desbloquear el audio.
  unlock() {
    getCtx()
  },
  tick() {
    beep(220, 0.03, 'square', 0.03)
  },
  key() {
    beep(660, 0.025, 'square', 0.025)
  },
  confirm() {
    beep(523, 0.08, 'square', 0.05)
    beep(784, 0.1, 'square', 0.05, 0.08)
  },
  back() {
    beep(392, 0.08, 'square', 0.05)
    beep(262, 0.1, 'square', 0.05, 0.08)
  },
  reveal() {
    beep(440, 0.06, 'triangle', 0.05)
    beep(880, 0.12, 'triangle', 0.05, 0.05)
  },
  diceRoll() {
    // rápida secuencia de clicks ascendentes
    for (let i = 0; i < 14; i++) {
      beep(200 + i * 40, 0.02, 'square', 0.02, i * 0.05)
    }
  },
  diceLand() {
    beep(660, 0.08, 'square', 0.06)
    beep(990, 0.14, 'square', 0.06, 0.09)
    beep(1320, 0.2, 'triangle', 0.05, 0.18)
  },
  warn() {
    beep(330, 0.12, 'sawtooth', 0.05)
    beep(330, 0.12, 'sawtooth', 0.05, 0.18)
  },
  boot() {
    beep(523, 0.1, 'square', 0.05)
    beep(659, 0.1, 'square', 0.05, 0.1)
    beep(784, 0.1, 'square', 0.05, 0.2)
    beep(1046, 0.25, 'triangle', 0.05, 0.3)
  },
}
