'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { MapPin, Search, Plus, MessageCircle, User as UserIcon, LogOut } from 'lucide-react'

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">CampusFound</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Search className="h-4 w-4" />
            Browse
          </Link>
          {user && (
            <>
              <Link
                href="/report"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive('/report') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Plus className="h-4 w-4" />
                Report Item
              </Link>
              <Link
                href="/messages"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive('/messages') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Messages
              </Link>
              <Link
                href="/my-items"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive('/my-items') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                My Items
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-secondary" />
          ) : user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
