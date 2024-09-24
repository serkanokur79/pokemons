'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
// import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, X, ChevronLeft, ChevronRight, MoreHorizontal, LogIn, LogOut } from "lucide-react"
import { Pokemon, PokemonRegion, PokemonType } from '@/lib/types'
import HyperText from './magicui/hyper-text'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { useFavorites } from '@/hooks/useFavorites';

const supabase = createClientComponentClient()

type PokemonsPageProps = {
  pokemons: Pokemon[];
  pokemonTypes: PokemonType[];
  pokemonRegions: PokemonRegion[];
};

export function PokemonsPage({ pokemons, pokemonTypes, pokemonRegions }: PokemonsPageProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { favorites, addFavorite, removeFavorite } = useFavorites(user, pokemons);
  const [currentPage, setCurrentPage] = useState(1)
  const [pokemonsPerPage, setPokemonsPerPage] = useState(20)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoginView, setIsLoginView] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? session.user : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const filteredPokemons = useMemo(() => {
    return pokemons.filter(pokemon =>
      (!selectedType || selectedType === 'all' || pokemon?.type?.includes(selectedType)) &&
      (!selectedRegion || selectedRegion === 'all' || pokemon?.region === selectedRegion)
    )
  }, [selectedType, selectedRegion, pokemons])

  const indexOfLastPokemon = currentPage * pokemonsPerPage
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage
  const currentPokemons = filteredPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon)

  const totalPages = Math.ceil(filteredPokemons.length / pokemonsPerPage)

  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);

    if (totalPages <= 1) {
      return range;
    }

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    range.push(totalPages);

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Error logging in:', error.message)
      toast.error(`Error logging in: ${error.message}`)
    } else {
      setIsLoginModalOpen(false)
      toast.success('Login successful!')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Error signing up:', error.message);
      toast.error(`Error signing up: ${error.message}`);
    } else {
      setIsLoginModalOpen(false);
      toast.success('Signup successful! Please check your email for confirmation.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logout successful!')
  }


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pokémon Collection</h1>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" aria-label="Your Favorite Pokémon">
                    Your Favorite Pokémon ({favorites.length})
                  </Button>
                </SheetTrigger>
                <SheetContent className='bg-white text-black'>
                  <SheetHeader>
                    <SheetTitle>Your Favorite Pokémon</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    {favorites.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Number</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {favorites.map((pokemon) => (
                            <TableRow key={pokemon.number}>
                              <TableCell>
                                <Image
                                  src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.number}.png`}
                                  alt={pokemon.name}
                                  width={50}
                                  height={50}
                                  className="rounded-full"
                                />
                              </TableCell>
                              <TableCell>{pokemon.number}</TableCell>
                              <TableCell>{pokemon.name}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => removeFavorite(pokemon)} aria-label="Remove from favorites">
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p>You have not added any favorite Pokémon yet.</p>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <Avatar>
                <AvatarImage src={user.user_metadata.avatar_url} />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <LogIn className="mr-2 h-4 w-4" /> Log In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{isLoginView ? 'Log In' : 'Sign Up'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={isLoginView ? handleLogin : handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {isLoginView ? 'Log In' : 'Sign Up'}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <Button variant="link" onClick={() => setIsLoginView(!isLoginView)}>
                    {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-wrap items-center gap-4">

          <div className="flex items-center  space-x-2">
            <Label htmlFor="filter-by-type">Filter by type</Label>
            <Select
              value={selectedType || "all"}
              onValueChange={(value) => {
                setSelectedType(value === "" ? null : value)
                setCurrentPage(1)
              }}
       
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" id="filter-by-type" aria-autocomplete="none" aria-controls="radix-:rt3:" aria-expanded="false" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {pokemonTypes.map((type) => (
                  <SelectItem key={type.name} value={type.name}>
                    <div className="flex items-center">
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Label htmlFor="filter-by-region">Filter by region</Label>
              <Select
                id="filter-by-region"
                value={selectedRegion || "all"}
                onValueChange={(value) => {
                  setSelectedRegion(value === "all" ? null : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {pokemonRegions.map((region) => (
                    <SelectItem key={region.name} value={region.name}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center  space-x-2">
          <Select
            value={pokemonsPerPage.toString()}
            onValueChange={(value) => {
              setPokemonsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pokémon per page" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100, 200].map((number) => (
                <SelectItem key={number} value={number.toString()}>
                  {number} Pokémon per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
          >
            
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

   

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative group/back "
      >


        {currentPokemons.map((pokemon) => (
          <Card key={pokemon.number}
            className="flex flex-col group border-2 border-gray-300  hover:shadow-sky-700 shadow-lg shadow-white"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className='flex flex-row justify-between w-full'>  <HyperText
                className="text-xl font-bold text-black dark:text-white"
                text={pokemon.name}
              />
                <HyperText
                  className="text-xl font-bold text-black dark:text-white"
                  text={"#" + pokemon.number}
                /></CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center "  >
              <Image
                src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.number}.png`}
                alt={pokemon.name}
                width={150}
                height={100}
                className=" mb-1 z-10 hover:scale-150 group-hover:scale-125 transition-all group-hover:z-20 w-full h-auto"
              />
              <div className="justify-between flex flex-row gap-2 w-full bg-transparent group-hover:pt-4">
                <div className='text-sm flex flex-col gap-1'>
                  <p>Type: {pokemon?.type?.join(', ')}</p>
                  <p>Region: {pokemon.region}</p>
                </div>
                <div>
                  {user ? <Button
                    variant="outline"
                    size="icon"
                    onClick={() => favorites.some(fav => fav.number === pokemon.number) ? removeFavorite(pokemon) : addFavorite(pokemon)}
                    title={favorites.some(fav => fav.number === pokemon.number) ? "Remove from favorites" : "Add to favorites"}
                    // disabled={favorites.some(fav => fav.number === pokemon.number) || favorites.length >= 5}
                    className='group/but group-hover:mt-4 mt-3 '
                    aria-label={favorites.some(fav => fav.number === pokemon.number) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`h-4 w-4 group-hover/but:w-5 group-hover/but:h-5 ${favorites.some(fav => fav.number === pokemon.number) ? 'fill-red-600 text-red-800' : ''}`} />
                  </Button> : null}
                </div>
              </div>

            </CardContent>
      
          </Card>
        ))}
      </div>

      <div className="mt-4 flex justify-center space-x-2">
        {getPaginationRange().map((page, index) => (
          page === '...' ? (
            <Button key={index} variant="outline" size="icon" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => changePage(Number(page))}
            >
              {page}
            </Button>
          )
        ))}
      </div>
    </div>
  )
}