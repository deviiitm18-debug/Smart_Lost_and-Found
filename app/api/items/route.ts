import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  const location = searchParams.get('location')
  const search = searchParams.get('search')
  const status = searchParams.get('status') || 'active'

  let query = supabase
    .from('items')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }
  if (category) {
    query = query.eq('category', category)
  }
  if (location) {
    query = query.eq('location', location)
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  const { data, error } = await supabase
    .from('items')
    .insert({
      ...body,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
