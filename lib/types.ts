export type Pokemon = {
  name: string
  number: number
  type: string[]
  region: string,
  image?: string
}

export type PokemonType = {
  name: string,
  image: string
}

export type PokemonRegion = {
  name: string
}