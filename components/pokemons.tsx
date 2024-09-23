'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
// import { useMotionValue } from "framer-motion";
// import { MouseEvent } from "react";
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
// import { Card3dBody, Card3dContainer, Card3dItem } from './ui/3d-card'
// Initialize Supabase client
const supabase = createClient(`${process.env.NEXT_PUBLIC_SUPABASE_URL}`, `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)





export function PokemonsPage({ pokemons, pokemonTypes, pokemonRegions }: { pokemons: Pokemon[], pokemonTypes: PokemonType[], pokemonRegions: PokemonRegion[] }) {
  const [favorites, setFavorites] = useState<Pokemon[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pokemonsPerPage, setPokemonsPerPage] = useState(20)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoginView, setIsLoginView] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ? session.user : null)
      if (session?.user) {
        await fetchFavorites(session.user.id)
      } else {
        setFavorites([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    if (user) {
      const favoritesSubscription = supabase
        .channel('favorites')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, payload => {
          fetchFavorites(user.id)
          console.log(payload)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(favoritesSubscription)
      }
    }
  }, [user])

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('pokemon_number')
        .eq('user_id', userId)

      if (error) throw error

      const favoriteNumbers = data.map(fav => fav.pokemon_number)
      const favoritePokemon = pokemons.filter(pokemon => favoriteNumbers.includes(pokemon.number))
      setFavorites(favoritePokemon)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      // You can add a toast notification here to inform the user about the error
    }
  }


  const addFavorite = async (pokemon: Pokemon) => {
    if (!user) {
      console.error('User not logged in')
      return
    }

    if (favorites.length >= 10) {
      console.error('Maximum number of favorites reached')
      return
    }

    if (favorites.some(fav => fav.number === pokemon.number)) {
      console.error('Pokemon already in favorites')
      return
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, pokemon_number: pokemon.number })
        .select()

      if (error) throw error

      console.log('Favorite added successfully:', data)
      await fetchFavorites(user.id)
    } catch (error) {
      console.error('Error adding favorite:', error)
      // You can add a toast notification here to inform the user about the error
    }
  }

  const removeFavorite = async (pokemon: Pokemon) => {
    if (user) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('pokemon_number', pokemon.number)

      if (error) {
        console.error('Error removing favorite:', error)
      }
    }
  }

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
    } else {
      setIsLoginModalOpen(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error('Error signing up:', error.message)
    } else {
      setIsLoginModalOpen(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // const mouseX = useMotionValue(0);
  // const mouseY = useMotionValue(0);

  // function handleMouseMove({
  //   currentTarget,
  //   clientX,
  //   clientY,
  // }: MouseEvent) {
  //   const { left, top } = currentTarget.getBoundingClientRect();

  //   mouseX.set(clientX - left);
  //   mouseY.set(clientY - top);
  // }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pokémon Collection</h1>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
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
                                <Button variant="ghost" size="icon" onClick={() => removeFavorite(pokemon)}>
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
              <Button variant="ghost" size="icon" onClick={handleLogout}>
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
            <Select
              value={selectedType || "all"}
              onValueChange={(value) => {
                setSelectedType(value === "" ? null : value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
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

            <Select
              value={selectedRegion || "all"}
              onValueChange={(value) => {
                setSelectedRegion(value === "all" ? null : value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by region" />
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
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1"
      >
        {
          currentPokemons.map((pokemon) => (
            <Card3dContainer key={pokemon.number}>
              <Card3dBody className="relative group/card rounded-xl p-4  w-auto bg-zinc-50 hover:bg-transparent">
                <Card3dItem
                  translateZ="80"
                  className="text-xl font-bold text-neutral-600 dark:text-white justify-between flex items-center mt-6 mx-2 flex-row  w-7/8"
                >
                  <HyperText
                    className="text-xl font-bold text-black dark:text-white"
                    text={pokemon.name}
                  />
                  <HyperText
                    className="text-xl font-bold text-black dark:text-white "
                    text={"#" + pokemon.number}
                  />

                </Card3dItem>

                <Card3dItem translateZ="60" className="w-full mt-4 ml-6">
                  <Image
                    src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.number}.png`}
                    height="300"
                    width="300"
                    className="h-40 w-auto object-cover  group-hover/card:scale-110"
                    alt="thumbnail"
                  />
                </Card3dItem>
                <Card3dItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300 mx-auto w-3/4 "
                >
                  <div className='text-sm   '>
                    <p>Type: {pokemon?.type?.join(', ')}</p>

                  </div>
                </Card3dItem>
                <Card3dItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300 mx-auto w-3/4 "
                >
                  <div className='text-sm   '>

                    <p>Region: {pokemon.region}</p>
                  </div>
                </Card3dItem>
                <div className="flex justify-end items-center -mt-6">

                  <Card3dItem
                    translateZ={70}
                    as='button'
                    className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => favorites.some(fav => fav.number === pokemon.number) ? removeFavorite(pokemon) : addFavorite(pokemon)}
                      title={favorites.some(fav => fav.number === pokemon.number) ? "Remove from favorites" : "Add to favorites"}
                      // disabled={favorites.some(fav => fav.number === pokemon.number) || favorites.length >= 5}
                      className='group'
                    >
                      <Heart className={`h-4 w-4 group-hover:w-5 group-hover:h-5 ${favorites.some(fav => fav.number === pokemon.number) ? 'fill-red-600 text-red-800' : ''}`} />
                    </Button>
                  </Card3dItem>

                </div>
              </Card3dBody>
            </Card3dContainer>
          ))
        }
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative group/back "
      // onMouseMove={handleMouseMove}
      >
        {/* <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover/back:opacity-100"
          style={{
            background: useMotionTemplate`
            radial-gradient(
              80px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 0, 0, 0.9),
              transparent 90%
            )
          `,
          }}
        /> */}

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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => favorites.some(fav => fav.number === pokemon.number) ? removeFavorite(pokemon) : addFavorite(pokemon)}
                  title={favorites.some(fav => fav.number === pokemon.number) ? "Remove from favorites" : "Add to favorites"}
                  // disabled={favorites.some(fav => fav.number === pokemon.number) || favorites.length >= 5}
                  className='group/but group-hover:mt-4 mt-3 '
                >
                  <Heart className={`h-4 w-4 group-hover/but:w-5 group-hover/but:h-5 ${favorites.some(fav => fav.number === pokemon.number) ? 'fill-red-600 text-red-800' : ''}`} />
                </Button>



              </div>

            </CardContent>
            {/* <CardFooter className="justify-between flex flex-row gap-2">
              <div className='text-sm gap-3'>
                <p>Type: {pokemon?.type?.join(', ')}</p>
                <p>Region: {pokemon.region}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => favorites.some(fav => fav.number === pokemon.number) ? removeFavorite(pokemon) : addFavorite(pokemon)}
                title={favorites.some(fav => fav.number === pokemon.number) ? "Remove from favorites" : "Add to favorites"}
              // disabled={favorites.some(fav => fav.number === pokemon.number) || favorites.length >= 5}
              >
                <Heart className={`h-4 w-4 ${favorites.some(fav => fav.number === pokemon.number) ? 'fill-primary' : ''}`} />
              </Button>
            </CardFooter> */}
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