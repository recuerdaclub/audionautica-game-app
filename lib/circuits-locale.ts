import type { AppLocale } from '@/lib/cookies'
import type { Circuit } from '@/lib/circuits'
import { CIRCUITS } from '@/lib/circuits'

const EN: Record<string, Pick<Circuit, 'name' | 'short' | 'desc' | 'plain'>> = {
  C1: {
    name: 'Bio-survival',
    short: 'BIO-SURVIVAL',
    desc: 'Oral security circuit. Advance / retreat. The body seeks nourishment and shelter.',
    plain:
      'Survival instinct: food, shelter, and feeling safe. What someone in danger or a baby needs first.',
  },
  C2: {
    name: 'Emotional-territorial',
    short: 'EMOTIONAL-TERRITORIAL',
    desc: 'Anal power circuit. Dominance and submission. Ego, territory, and pack status.',
    plain:
      'Power and territory feelings: pride, fear of losing your place, competing or yielding. When someone crosses into «your space».',
  },
  C3: {
    name: 'Symbolic-rational',
    short: 'SYMBOLIC / RATIONAL',
    desc: 'Semantic time circuit. Language, maps, tools, and logical thought.',
    plain:
      'Thinking with words, numbers, and plans: reading, talking, lists, and solving problems in your head.',
  },
  C4: {
    name: 'Socio-sexual',
    short: 'SOCIO-SEXUAL',
    desc: 'Tribal moral circuit. Adult roles, social rules, and cultural reproduction.',
    plain:
      'Belonging to a group: customs, partnership, and «what’s right» in your family or community.',
  },
  C5: {
    name: 'Neurosomatic',
    short: 'NEUROSOMATIC',
    desc: 'Hedonic body circuit. Sensory bliss, zero gravity, embodied mind.',
    plain:
      'Body pleasure in the moment: laughter, music, a hug, deep relaxation without overthinking.',
  },
  C6: {
    name: 'Neuroelectric',
    short: 'NEUROELECTRIC',
    desc: 'Metaprogrammer circuit. Mind observing mind. Reprogramming your own reality.',
    plain:
      'Watching your own habits and changing them on purpose: «why do I react like this?» and choosing another response.',
  },
  C7: {
    name: 'Neurogenetic',
    short: 'NEUROGENETIC',
    desc: 'DNA / collective memory circuit. Archetypes, ancestors, species consciousness.',
    plain:
      'Shared human big pictures: myths, dreams, ancestry, and feeling part of something larger.',
  },
  C8: {
    name: 'Quantum / non-local',
    short: 'QUANTUM / NON-LOCAL',
    desc: 'Non-local circuit. Consciousness beyond space-time. Contact with the unlimited.',
    plain:
      'A sense of unity or transcendence beyond everyday self. The «moment when everything clicks».',
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
