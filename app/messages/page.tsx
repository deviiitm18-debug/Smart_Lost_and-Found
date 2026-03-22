import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessagesClient } from './messages-client'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/messages')
  }

  // Get all messages for this user
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Get unique item IDs from messages
  const itemIds = [...new Set(messages?.map(m => m.item_id) || [])]

  // Fetch items for these conversations
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .in('id', itemIds)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            Your conversations about lost and found items
          </p>
        </div>

        <MessagesClient 
          messages={messages || []} 
          items={items || []} 
          userId={user.id}
        />
      </main>
    </div>
  )
}
