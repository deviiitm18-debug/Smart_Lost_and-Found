'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, LOCATIONS, CAMPUSES, ItemType } from '@/lib/types'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ItemFormProps {
  defaultType?: ItemType
}

export function ItemForm({ defaultType = 'lost' }: ItemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type: defaultType,
    title: '',
    description: '',
    category: '',
    location: '',
    campus: '',
    date_occurred: new Date().toISOString().split('T')[0]
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setImageUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      router.push(`/item/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'lost' })}
          className={`flex-1 rounded-md py-3 text-sm font-semibold transition-colors ${
            formData.type === 'lost' 
              ? 'bg-destructive text-destructive-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          I Lost Something
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'found' })}
          className={`flex-1 rounded-md py-3 text-sm font-semibold transition-colors ${
            formData.type === 'found' 
              ? 'bg-success text-success-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          I Found Something
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Photo
        </label>
        <div className="relative">
          {imageUrl ? (
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
              <Image src={imageUrl} alt="Item" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1.5 text-background transition-colors hover:bg-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 transition-colors hover:border-primary hover:bg-secondary">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload an image</span>
                  <span className="mt-1 text-xs text-muted-foreground/70">PNG, JPG up to 5MB</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-foreground">
          Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Black iPhone 15 Pro"
          className="h-12 w-full rounded-lg border border-input bg-card px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Provide details that can help identify the item..."
          className="w-full rounded-lg border border-input bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-foreground">
            Category *
          </label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="mb-2 block text-sm font-medium text-foreground">
            Location *
          </label>
          <select
            id="location"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select location</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="campus" className="mb-2 block text-sm font-medium text-foreground">
            Campus
          </label>
          <select
            id="campus"
            value={formData.campus}
            onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select campus</option>
            {CAMPUSES.map((campus) => (
              <option key={campus} value={campus}>{campus}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-foreground">
            Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
          </label>
          <input
            id="date"
            type="date"
            required
            value={formData.date_occurred}
            onChange={(e) => setFormData({ ...formData, date_occurred: e.target.value })}
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          `Report ${formData.type === 'lost' ? 'Lost' : 'Found'} Item`
        )}
      </button>
    </form>
  )
}
