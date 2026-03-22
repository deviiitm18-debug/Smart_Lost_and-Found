'use client'

import { Item } from '@/lib/types'
import { Calendar, MapPin, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Link href={`/item/${item.id}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Tag className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            item.type === 'lost' 
              ? 'bg-destructive text-destructive-foreground' 
              : 'bg-success text-success-foreground'
          }`}>
            {item.type}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-card-foreground line-clamp-1 group-hover:text-primary">
            {item.title}
          </h3>
          
          {item.description && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {item.category}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {item.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(item.date_occurred)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
