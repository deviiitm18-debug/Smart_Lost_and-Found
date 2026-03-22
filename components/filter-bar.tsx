'use client'

import { CATEGORIES, LOCATIONS, ItemType } from '@/lib/types'
import { Search, X } from 'lucide-react'

interface FilterBarProps {
  type: ItemType | ''
  category: string
  location: string
  search: string
  onTypeChange: (type: ItemType | '') => void
  onCategoryChange: (category: string) => void
  onLocationChange: (location: string) => void
  onSearchChange: (search: string) => void
  onClear: () => void
}

export function FilterBar({
  type,
  category,
  location,
  search,
  onTypeChange,
  onCategoryChange,
  onLocationChange,
  onSearchChange,
  onClear
}: FilterBarProps) {
  const hasFilters = type || category || location || search

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for items..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => onTypeChange('')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              type === '' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onTypeChange('lost')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              type === 'lost' ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => onTypeChange('found')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              type === 'found' ? 'bg-success text-success-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Found
          </button>
        </div>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={onClear}
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
