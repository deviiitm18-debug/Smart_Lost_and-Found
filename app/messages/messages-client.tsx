'use client'

import { useState } from 'react'
import { Message, Item } from '@/lib/types'
import { MessageThread } from '@/components/message-thread'
import { MessageCircle, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface MessagesClientProps {
  messages: Message[]
  items: Item[]
  userId: string
}

export function MessagesClient({ messages, items, userId }: MessagesClientProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  // Group messages by item
  const conversations = items.map(item => {
    const itemMessages = messages.filter(m => m.item_id === item.id)
    const lastMessage = itemMessages[0]
    const unreadCount = itemMessages.filter(m => 
      m.recipient_id === userId && !m.is_read
    ).length

    return {
      item,
      lastMessage,
      unreadCount,
      messageCount: itemMessages.length
    }
  }).filter(c => c.messageCount > 0)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
        <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">No messages yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation by contacting someone about an item
        </p>
      </div>
    )
  }

  if (selectedItem) {
    const recipientId = selectedItem.user_id === userId 
      ? messages.find(m => m.item_id === selectedItem.id && m.sender_id !== userId)?.sender_id || ''
      : selectedItem.user_id

    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedItem(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to conversations
        </button>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-secondary">
            {selectedItem.image_url ? (
              <Image
                src={selectedItem.image_url}
                alt={selectedItem.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <MessageCircle className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
              selectedItem.type === 'lost' 
                ? 'bg-destructive/10 text-destructive' 
                : 'bg-success/10 text-success'
            }`}>
              {selectedItem.type}
            </span>
            <h3 className="font-semibold text-foreground">{selectedItem.title}</h3>
            <p className="text-sm text-muted-foreground">{selectedItem.location}</p>
          </div>
        </div>

        <MessageThread item={selectedItem} recipientId={recipientId} />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map(({ item, lastMessage, unreadCount }) => (
        <button
          key={item.id}
          onClick={() => setSelectedItem(item)}
          className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-secondary/50"
        >
          <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-secondary">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <MessageCircle className="h-5 w-5" />
              </div>
            )}
            <div className={`absolute -right-1 -top-1 h-3 w-3 rounded-full ${
              item.type === 'lost' ? 'bg-destructive' : 'bg-success'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {lastMessage && formatTime(lastMessage.created_at)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {lastMessage?.content || 'No messages'}
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          )}

          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}
