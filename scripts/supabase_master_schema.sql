-- MASTER SUPABASE SCHEMA
-- This file contains all the table definitions and RLS policies for the Romeo Alpha Maritime project.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROMOTIONAL ADS TABLE
CREATE TABLE IF NOT EXISTS promotional_ads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE promotional_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON promotional_ads FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access" ON promotional_ads FOR ALL USING (auth.role() = 'authenticated');

-- 3. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  created_at timestamp WITH time zone NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow everyone to insert messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to view messages" ON public.contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (true);

-- 4. FAQS TABLE
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access for faqs" ON faqs FOR ALL USING (auth.role() = 'authenticated');

-- 5. MARKETPLACE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('sale', 'hire', 'repair', 'scrap')),
    price TEXT,
    image_url TEXT,
    location TEXT,
    specs jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to view marketplace items" ON public.marketplace_items FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Allow authenticated users to manage marketplace items" ON public.marketplace_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. NEWSLETTER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  created_at timestamp WITH time zone NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  CONSTRAINT newsletter_subscriptions_pkey PRIMARY KEY (id)
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to subscribe" ON public.newsletter_subscriptions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated users to view subscriptions" ON public.newsletter_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete subscriptions" ON public.newsletter_subscriptions FOR DELETE TO authenticated USING (true);

-- 7. PARTNERSHIP PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS partnership_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    representative_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_interest TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partnership_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for partnership_proposals" ON partnership_proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated full access for partnership_proposals" ON partnership_proposals FOR ALL USING (auth.role() = 'authenticated');


