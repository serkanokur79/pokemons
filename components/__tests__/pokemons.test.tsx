 import { PokemonsPage } from '@/components/pokemons';
import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom'; // Add this import at the top of your file

import pokemons from './pokemon_last.json';
import pokemonTypes from './pokemon_types.json';
import pokemonRegions from './pokemon_regions.json';

// Import the Pokemon type
import { Pokemon, PokemonRegion, PokemonType } from '@/lib/types';

describe('PokemonsPage', () => {

    const pokemonsData: Pokemon[] = pokemons as unknown as Pokemon[]; // Cast to unknown first
    const pokemonTypesData: PokemonType[] = pokemonTypes as unknown as PokemonType[]; // Cast to unknown first
    const pokemonRegionsData: PokemonRegion[] = pokemonRegions as unknown as PokemonRegion[]; // Cast to unknown first
      
  test('renders the page title', () => {

    render(<PokemonsPage pokemons={pokemonsData} pokemonTypes={pokemonTypesData} pokemonRegions={pokemonRegionsData} />);
    const pageTitle = screen.getByText('Pokémon Collection');
    expect(pageTitle).toBeInTheDocument();
  });

  describe('PokemonsPage', () => {
    test('renders without crashing', () => {
        render(<PokemonsPage pokemons={pokemonsData} pokemonTypes={pokemonTypesData} pokemonRegions={pokemonRegionsData} />);
        expect(screen.getByText('Pokémon Collection')).toBeInTheDocument();
    });
});


//   test('filters pokemons by region', () => {
//     render(<PokemonsPage pokemons={pokemonsData} pokemonTypes={pokemonTypesData} pokemonRegions={pokemonRegionsData} />);
//     const filterByRegionSelect = screen.getByLabelText('Filter by region', { selector: 'select' });
//     userEvent.selectOptions(filterByRegionSelect, 'Kanto'); // Assuming 'Kanto' is one of the regions in the mock data
//     const filteredPokemons = screen.getAllByTestId('pokemon-card');
//     expect(filteredPokemons.length).toBeGreaterThan(0); // Ensure that there are Pokémon displayed
//     filteredPokemons.forEach(pokemon => {
//         expect(pokemon).toHaveTextContent('Kanto'); // Check that each displayed Pokémon belongs to the Kanto region
//     });
// });

//   test('changes the page when pagination buttons are clicked', () => {
//     render(<PokemonsPage pokemons={pokemonsData} pokemonTypes={pokemonTypesData} pokemonRegions={pokemonRegionsData} />);
//     const nextPageButton = screen.getByLabelText('Next Page');
//     userEvent.click(nextPageButton);
//     const currentPageIndicator = screen.getByText(/Page 2 of 3/i); // Use regex for flexible matching
//     expect(currentPageIndicator).toBeInTheDocument();
//   });

//   test('adds a pokemon to favorites', () => {
//     render(<PokemonsPage pokemons={pokemonsData} pokemonTypes={pokemonTypesData} pokemonRegions={pokemonRegionsData} />);
//     const favoriteButton = screen.getAllByLabelText('Add to favorites')[0];
//     userEvent.click(favoriteButton);
//     const favoritePokemons = screen.getAllByTestId('favorite-pokemon');
//     expect(favoritePokemons).toHaveLength(1);
//   });

//   test('removes a pokemon from favorites', () => {
//     render(<PokemonsPage pokemons={pokemonsData} pokemonTypes={pokemonTypesData} pokemonRegions={pokemonRegionsData} />);
//     const favoriteButton = screen.getAllByLabelText('Remove from favorites')[0];
//     userEvent.click(favoriteButton);
//     const removeFavoriteButton = screen.getAllByLabelText('Remove from favorites')[0];
//     userEvent.click(removeFavoriteButton);
//     const favoritePokemons = screen.queryAllByTestId('favorite-pokemon');
//     expect(favoritePokemons).toHaveLength(0);
//   });


});