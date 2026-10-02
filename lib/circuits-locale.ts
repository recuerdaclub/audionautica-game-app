import type { AppLocale } from '@/lib/cookies'
import type { Circuit } from '@/lib/circuits'
import { CIRCUITS } from '@/lib/circuits'

const EN: Record<string, Pick<Circuit, 'name' | 'short' | 'desc'>> = {
  C1: {
    name: 'Bio-survival',
    short: 'BIO-SURVIVAL',
    desc: 'Oral security circuit. Advance / retreat. The body seeks nourishment and shelter.',
  },
  C2: {
    name: 'Emotional-territorial',
    short: 'EMOTIONAL-TERRITORIAL',
    desc: 'Anal power circuit. Dominance and submission. Ego, territory, and pack status.',
  },
  C3: {
    name: 'Symbolic-rational',
    short: 'SYMBOLIC / RATIONAL',
    desc: 'Semantic time circuit. Language, maps, tools, and logical thought.',
  },
  C4: {
    name: 'Socio-sexual',
    short: 'SOCIO-SEXUAL',
    desc: 'Tribal moral circuit. Adult roles, social rules, and cultural reproduction.',
  },
  C5: {
    name: 'Neurosomatic',
    short: 'NEUROSOMATIC',
    desc: 'Hedonic body circuit. Sensory bliss, zero gravity, embodied mind.',
  },
  C6: {
    name: 'Neuroelectric',
    short: 'NEUROELECTRIC',
    desc: 'Metaprogrammer circuit. Mind observing mind. Reprogramming your own reality.',
  },
  C7: {
    name: 'Neurogenetic',
    short: 'NEUROGENETIC',
    desc: 'DNA / collective memory circuit. Archetypes, ancestors, species consciousness.',
  },
  C8: {
    name: 'Quantum / non-local',
    short: 'QUANTUM / NON-LOCAL',
    desc: 'Non-local circuit. Consciousness beyond space-time. Contact with the unlimited.',
  },
}

export function circuitForLocale(
  code: string,
  locale: AppLocale,
): Circuit | undefined {
  const base = CIRCUITS.find((c) => c.code === code)
  if (!base) return undefined
  if (locale === 'es') return base
  const en = EN[code]
  if (!en) return base
  return { ...base, ...en }
}
