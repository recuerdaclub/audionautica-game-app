export type Circuit = {
  code: string
  n: number
  name: string
  short: string
  desc: string
}

// Los 8 circuitos de conciencia (modelo de Timothy Leary / Robert Anton Wilson)
export const CIRCUITS: Circuit[] = [
  {
    code: 'C1',
    n: 1,
    name: 'Bio-supervivencia',
    short: 'BIO-SUPERVIVENCIA',
    desc: 'Circuito oral de seguridad. Avanzar / retroceder. El cuerpo busca nutrición y refugio.',
  },
  {
    code: 'C2',
    n: 2,
    name: 'Emocional-territorial',
    short: 'EMOCIONAL-TERRITORIAL',
    desc: 'Circuito anal del poder. Dominio y sumisión. Ego, territorio y estatus en la manada.',
  },
  {
    code: 'C3',
    n: 3,
    name: 'Simbólico-racional',
    short: 'SIMBÓLICO / RACIONAL',
    desc: 'Circuito semántico del tiempo. Lenguaje, mapas, herramientas y pensamiento lógico.',
  },
  {
    code: 'C4',
    n: 4,
    name: 'Socio-sexual',
    short: 'SOCIO-SEXUAL',
    desc: 'Circuito moral de la tribu. Roles adultos, reglas sociales y reproducción cultural.',
  },
  {
    code: 'C5',
    n: 5,
    name: 'Neurosomático',
    short: 'NEUROSOMÁTICO',
    desc: 'Circuito hedónico del cuerpo. Éxtasis sensorial, gravedad cero, la mente encarnada.',
  },
  {
    code: 'C6',
    n: 6,
    name: 'Neuroeléctrico',
    short: 'NEUROELÉCTRICO',
    desc: 'Circuito metaprogramador. La mente observa la mente. Reprogramar la propia realidad.',
  },
  {
    code: 'C7',
    n: 7,
    name: 'Neurogenético',
    short: 'NEUROGENÉTICO',
    desc: 'Circuito del ADN / memoria colectiva. Arquetipos, ancestros y consciencia de la especie.',
  },
  {
    code: 'C8',
    n: 8,
    name: 'Cuántico / no-local',
    short: 'CUÁNTICO / NO-LOCAL',
    desc: 'Circuito no-local. Consciencia más allá del espacio-tiempo. Contacto con lo ilimitado.',
  },
]

export function circuitByCode(code: string): Circuit | undefined {
  return CIRCUITS.find((c) => c.code === code)
}
