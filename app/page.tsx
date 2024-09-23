
import pokemons from "@/lib/pokemon_last.json";
import { Pokemon, PokemonRegion, PokemonType } from "@/lib/types";
import pokemonTypes from "@/lib/pokemon_types.json";
import pokemonRegions from "@/lib/pokemon_regions.json";
import { PokemonsPage } from "@/components/pokemons";

function getPokemons(): Pokemon[] {
  return pokemons;
}

function getPokemonTypes(): PokemonType[] {
  return pokemonTypes;
}
function getPokemonRegions(): PokemonRegion[] {
  return pokemonRegions;
}

export default function Home() {
  const pokemons = getPokemons();
  const pokemonTypes = getPokemonTypes();
  const pokemonRegions = getPokemonRegions();
  return (
    <PokemonsPage pokemons={pokemons} pokemonTypes={pokemonTypes} pokemonRegions={pokemonRegions} />
  );
}
