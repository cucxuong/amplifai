export interface Persona {
  id: string
  label: string
  image: string
}

function personaAsset(filename: string): string {
  return `/${filename}`
}

export const PERSONAS: Persona[] = [
  { id: 'the-ai-innovator', label: 'The AI Innovator', image: personaAsset('the-ai-innovator.png') },
  { id: 'the-beauty-explorer', label: 'The Beauty Explorer', image: personaAsset('the-beauty-explorer.png') },
  { id: 'the-data-unicorn', label: 'The Data Unicorn', image: personaAsset('the-data-unicorn.png') },
  { id: 'the-pathfinder', label: 'The Pathfinder', image: personaAsset('the-explorer.png') },
  { id: 'the-future-visitor', label: 'The Future Visitor', image: personaAsset('the-future-visitor.png') },
  { id: 'the-spark-kitten', label: 'The Spark Kitten', image: personaAsset('the-spark-kitten.png') },
  { id: 'the-tech-strategist', label: 'The Tech Strategist', image: personaAsset('the-tech-strategist.png') },
]

export function getPersonaById(id?: string | null): Persona | null {
  if (!id)
    return null
  return PERSONAS.find(p => p.id === id) ?? null
}
