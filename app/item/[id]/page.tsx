import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Tag, User, Clock } from 'lucide-react'
import { ItemDetailClient } from './item-detail-client'

export default async function ItemDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !item) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const isOwner = user?.id === item.user_id

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Tag className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
            <div className={`absolute left-4 top-4 rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wide ${
              item.type === 'lost' 
                ? 'bg-destructive text-destructive-foreground' 
                : 'bg-success text-success-foreground'
            }`}>
              {item.type}
            </div>
            {item.status !== 'active' && (
              <div className="absolute right-4 top-4 rounded-full bg-foreground/80 px-4 py-1.5 text-sm font-semibold capitalize text-background">
                {item.status}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">{item.title}</h1>
              {item.description && (
                <p className="text-muted-foreground">{item.description}</p>
              )}
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground">Item Details</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium text-foreground">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{item.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Date {item.type === 'lost' ? 'Lost' : 'Found'}
                    </p>
                    <p className="font-medium text-foreground">{formatDate(item.date_occurred)}</p>
                  </div>
                </div>

                {item.campus && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Campus</p>
                      <p className="font-medium text-foreground">{item.campus}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Posted {formatTime(item.created_at)}
              </div>
            </div>

            <ItemDetailClient 
              item={item} 
              isOwner={isOwner}
              isLoggedIn={!!user}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
