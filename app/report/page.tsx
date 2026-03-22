import { Header } from '@/components/header'
import { ItemForm } from '@/components/item-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/report')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Report an Item</h1>
          <p className="text-muted-foreground">
            Fill in the details below to report a lost or found item
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <ItemForm />
        </div>
      </main>
    </div>
  )
}
