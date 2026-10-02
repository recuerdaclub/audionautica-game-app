export type Circuit = {
  code: string
  n: number
  name: string
  short: string
  desc: string
  plain: string
}

// Los 8 circuitos de conciencia (modelo de Timothy Leary / Robert Anton Wilson)
export const CIRCUITS: Circuit[] = [
  {
    code: 'C1',
    n: 1,
    name: 'Bio-supervivencia',
    short: 'BIO-SUPERVIVENCIA',
    desc: 'Circuito oral de seguridad. Avanzar / retroceder. El cuerpo busca nutrición y refugio.',
    plain:
      'Instinto de sobrevivir: comer, buscar refugio y sentirse a salvo. Lo primero que necesita alguien en peligro o un bebé.',
  },
  {
    code: 'C2',
    n: 2,
    name: 'Emocional-territorial',
    short: 'EMOCIONAL-TERRITORIAL',
    desc: 'Circuito anal del poder. Dominio y sumisión. Ego, territorio y estatus en la manada.',
    plain:
      'Emociones de poder y territorio: orgullo, miedo a perder tu lugar, competir o ceder. Cuando alguien invade «tu espacio».',
  },
  {
    code: 'C3',
    n: 3,
    name: 'Simbólico-racional',
    short: 'SIMBÓLICO / RACIONAL',
    desc: 'Circuito semántico del tiempo. Lenguaje, mapas, herramientas y pensamiento lógico.',
    plain:
      'Pensar con palabras, números y planes: leer, hablar, armar listas y resolver problemas con la cabeza.',
  },
  {
    code: 'C4',
    n: 4,
    name: 'Socio-sexual',
    short: 'SOCIO-SEXUAL',
    desc: 'Circuito moral de la tribu. Roles adultos, reglas sociales y reproducción cultural.',
    plain:
      'Pertenencia al grupo: costumbres, pareja y «lo que está bien» en tu familia o comunidad.',
  },
  {
    code: 'C5',
    n: 5,
    name: 'Neurosomático',
    short: 'NEUROSOMÁTICO',
    desc: 'Circuito hedónico del cuerpo. Éxtasis sensorial, gravedad cero, la mente encarnada.',
    plain:
      'Placer del cuerpo en el momento: risa, música, abrazo, relajación profunda sin darle mil vueltas.',
  },
  {
    code: 'C6',
    n: 6,
    name: 'Neuroeléctrico',
    short: 'NEUROELÉCTRICO',
    desc: 'Circuito metaprogramador. La mente observa la mente. Reprogramar la propia realidad.',
    plain:
      'Observar tus propios hábitos y cambiarlos a propósito: «¿por qué reacciono así?» y elegir otra respuesta.',
  },
  {
    code: 'C7',
    n: 7,
    name: 'Neurogenético',
    short: 'NEUROGENÉTICO',
    desc: 'Circuito del ADN / memoria colectiva. Arquetipos, ancestros y consciencia de la especie.',
    plain:
      'Ideas compartidas de la humanidad: mitos, sueños, ancestros y sentir parte de algo más grande.',
  },
  {
    code: 'C8',
    n: 8,
    name: 'Cuántico / no-local',
    short: 'CUÁNTICO / NO-LOCAL',
    desc: 'Circuito no-local. Consciencia más allá del espacio-tiempo. Contacto con lo ilimitado.',
    plain:
      'Sensación de unidad o trascendencia, más allá del yo de cada día. El «momento en que todo encaja».',
  },
]

export function circuitByCode(code: string): Circuit | undefined {
  return CIRCUITS.find((c) => c.code === code)
}
