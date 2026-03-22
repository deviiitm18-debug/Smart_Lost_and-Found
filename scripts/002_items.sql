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

CREATE INDEX IF NOT EXISTS idx_items_type ON public.items(type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_location ON public.items(location);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);
