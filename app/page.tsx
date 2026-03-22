'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Header } from '@/components/header'
import { ItemCard } from '@/components/item-card'
import { FilterBar } from '@/components/filter-bar'
import { Item, ItemType } from '@/lib/types'
import { Loader2, Search, MapPin } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch items')
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export default function HomePage() {
  const [type, setType] = useState<ItemType | ''>('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Build query string
  const params = new URLSearchParams()
  if (type) params.append('type', type)
  if (category) params.append('category', category)
  if (location) params.append('location', location)
  if (debouncedSearch) params.append('search', debouncedSearch)
  
  const queryString = params.toString()
  const apiUrl = `/api/items${queryString ? `?${queryString}` : ''}`

  const { data, isLoading } = useSWR<Item[]>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  })
  const items = Array.isArray(data) ? data : []

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const clearFilters = () => {
    setType('')
    setCategory('')
    setLocation('')
    setSearch('')
  }

  const lostCount = items.filter(i => i.type === 'lost').length
  const foundCount = items.filter(i => i.type === 'found').length

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <MapPin className="h-4 w-4" />
            Smart Campus Lost & Found
          </div>
          <h1 className="mb-4 text-pretty text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Lost Something?<br />
            <span className="text-primary">Find It Here.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
            Report lost items, browse found belongings, and connect with finders anonymously. 
            Helping students recover their belongings quickly.
          </p>
          {!user && (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          )}
        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-3xl font-bold text-foreground">{items.length}</p>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-3xl font-bold text-destructive">{lostCount}</p>
            <p className="text-sm text-muted-foreground">Lost Items</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-3xl font-bold text-success">{foundCount}</p>
            <p className="text-sm text-muted-foreground">Found Items</p>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <FilterBar
            type={type}
            category={category}
            location={location}
            search={search}
            onTypeChange={setType}
            onCategoryChange={setCategory}
            onLocationChange={setLocation}
            onSearchChange={setSearch}
            onClear={clearFilters}
          />
        </section>

        {/* Items Grid */}
        <section>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
              <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No items found</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                {search || type || category || location
                  ? 'Try adjusting your filters'
                  : 'Be the first to report an item'}
              </p>
              {user && (
                <Link
                  href="/report"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Report an Item
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
