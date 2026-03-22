-- Lost & Found Campus Platform Database Schema

-- Profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  campus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Items table for lost and found items
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  date_occurred DATE NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "items_select_all" ON public.items;
DROP POLICY IF EXISTS "items_insert_own" ON public.items;
DROP POLICY IF EXISTS "items_update_own" ON public.items;
DROP POLICY IF EXISTS "items_delete_own" ON public.items;

CREATE POLICY "items_select_all" ON public.items FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
CREATE POLICY "items_insert_own" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "items_update_own" ON public.items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "items_delete_own" ON public.items FOR DELETE USING (auth.uid() = user_id);

-- Messages table for anonymous contact
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;

CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_own" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items(type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_location ON public.items(location);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_item_id ON public.messages(item_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
