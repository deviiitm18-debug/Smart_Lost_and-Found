'use client'

import { useState, useEffect, useRef } from 'react'
import { Message, Item } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface MessageThreadProps {
  item: Item
  recipientId: string
}

export function MessageThread({ item, recipientId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/messages?item_id=${item.id}`)
        const data = await res.json()
        setMessages(data)
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel(`messages-${item.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `item_id=eq.${item.id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [item.id, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.id,
          recipient_id: recipientId,
          content: newMessage.trim()
        })
      })

      if (res.ok) {
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-[400px] flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="font-semibold text-foreground">Messages about: {item.title}</h3>
        <p className="text-sm text-muted-foreground">Chat anonymously with the {item.type === 'lost' ? 'finder' : 'owner'}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`mt-1 text-xs ${
                  message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
