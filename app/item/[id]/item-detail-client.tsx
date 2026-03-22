'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Item } from '@/lib/types'
import { MessageThread } from '@/components/message-thread'
import { MessageCircle, Check, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ItemDetailClientProps {
  item: Item
  isOwner: boolean
  isLoggedIn: boolean
}

export function ItemDetailClient({ item, isOwner, isLoggedIn }: ItemDetailClientProps) {
  const router = useRouter()
  const [showMessages, setShowMessages] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMarkResolved = async () => {
    setLoading(true)
    try {
      await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to update item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    setLoading(true)
    try {
      await fetch(`/api/items/${item.id}`, {
        method: 'DELETE'
      })
      router.push('/')
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-foreground">Want to contact the {item.type === 'lost' ? 'owner' : 'finder'}?</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Sign in to send anonymous messages
        </p>
        <Link
          href={`/auth/login?redirect=/item/${item.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign In to Contact
        </Link>
      </div>
    )
  }

  if (isOwner) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          {item.status === 'active' && (
            <button
              onClick={handleMarkResolved}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success py-3 font-semibold text-success-foreground transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Mark as Resolved
                </>
              )}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-destructive bg-transparent px-4 py-3 font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {showMessages ? (
          <MessageThread item={item} recipientId={item.user_id} />
        ) : (
          <button
            onClick={() => setShowMessages(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <MessageCircle className="h-5 w-5" />
            View Messages
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showMessages ? (
        <MessageThread item={item} recipientId={item.user_id} />
      ) : (
        <button
          onClick={() => setShowMessages(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <MessageCircle className="h-5 w-5" />
          Contact {item.type === 'lost' ? 'Owner' : 'Finder'} Anonymously
        </button>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Your identity will remain anonymous during the conversation
      </p>
    </div>
  )
}
