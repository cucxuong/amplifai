export interface Persona {
  id: string
  label: string
  image: string
}

function personaAsset(filename: string): string {
  return `/persona/${filename}`
}

export const PERSONAS: Persona[] = [
  { id: 'the-ai-innovator', label: 'The AI Innovator', image: personaAsset('The AI Innovator.png') },
  { id: 'the-beauty-explorer', label: 'The Beauty Explorer', image: personaAsset('The Beauty Explorer.png') },
  { id: 'the-data-pup', label: 'The Data Pup', image: personaAsset('The Data Pup.png') },
  { id: 'the-explorer', label: 'The Explorer', image: personaAsset('The Explorer.png') },
  { id: 'the-future-visitor', label: 'The Future Visitor', image: personaAsset('The Future Visitor.png') },
  { id: 'the-spark-kitten', label: 'The Spark Kitten', image: personaAsset('The Spark Kitten.png') },
  { id: 'the-tech-strategist', label: 'The Tech Strategist', image: personaAsset('The Tech Strategist.png') },
]

export function getPersonaById(id?: string | null): Persona | null {
  if (!id)
    return null
  return PERSONAS.find(p => p.id === id) ?? null
}
