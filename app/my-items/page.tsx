import { Header } from '@/components/header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ItemCard } from '@/components/item-card'
import { Plus, Package } from 'lucide-react'
import Link from 'next/link'

export default async function MyItemsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/my-items')
  }

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const activeItems = items?.filter(i => i.status === 'active') || []
  const resolvedItems = items?.filter(i => i.status === 'resolved') || []

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">My Items</h1>
            <p className="text-muted-foreground">
              Manage your reported lost and found items
            </p>
          </div>
          <Link
            href="/report"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            Report Item
          </Link>
        </div>

        {!items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">No items yet</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              You haven{"'"}t reported any lost or found items
            </p>
            <Link
              href="/report"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Report Your First Item
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {activeItems.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  Active ({activeItems.length})
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {activeItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {resolvedItems.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
                  Resolved ({resolvedItems.length})
                </h2>
                <div className="grid gap-6 opacity-60 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {resolvedItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
