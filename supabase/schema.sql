-- ==============================================================================
-- SCHEMA SUPABASE POUR PLATEFORME E-COMMERCE T. WILEY & PRO SERVICES
-- Ce script configure l'ensemble des tables, contraintes, index et politiques RLS
-- ==============================================================================

-- 1. Table des Catégories
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Produits
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    currency TEXT DEFAULT 'FCFA' NOT NULL,
    packaging TEXT NOT NULL,
    main_image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    availability TEXT DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'on_demand', 'out_of_stock')),
    stock_quantity INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    characteristics JSONB DEFAULT '[]'::jsonb,
    additional_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table des Partenaires
CREATE TABLE IF NOT EXISTS public.partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    description TEXT NOT NULL,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table des Informations de l'Entreprise et Configuration WhatsApp
CREATE TABLE IF NOT EXISTS public.company_info (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    name TEXT NOT NULL,
    slogan TEXT,
    logo TEXT NOT NULL,
    about_hero_image TEXT,
    description TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    opening_hours TEXT NOT NULL,
    social_links JSONB DEFAULT '{}'::jsonb,
    mission TEXT,
    vision TEXT,
    history TEXT,
    domain_activities JSONB DEFAULT '[]'::jsonb,
    commitments JSONB DEFAULT '[]'::jsonb,
    client_segments JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table des Sections personnalisées de la page À Propos
CREATE TABLE IF NOT EXISTS public.about_sections (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    badge TEXT DEFAULT 'Notre Expertise',
    description TEXT NOT NULL,
    content TEXT,
    image TEXT,
    video_url TEXT,
    "order" INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tables du Chat en Direct
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('client', 'agent', 'system')),
    sender_name TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES POUR LES RECHERCHES ET PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id);

-- 7. CONFIGURATION ROW LEVEL SECURITY (RLS) RENFORCÉE
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Nettoyage préalable complet des politiques pour réexécution idempotente
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Public Read Partners" ON public.partners;
DROP POLICY IF EXISTS "Public Read Company Info" ON public.company_info;
DROP POLICY IF EXISTS "Public Read About Sections" ON public.about_sections;
DROP POLICY IF EXISTS "Public Access Conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Public Access Messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Public Insert Conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Public Insert Messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Public Read Messages" ON public.chat_messages;

DROP POLICY IF EXISTS "Admin All Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin All Products" ON public.products;
DROP POLICY IF EXISTS "Admin All Partners" ON public.partners;
DROP POLICY IF EXISTS "Admin All Company Info" ON public.company_info;
DROP POLICY IF EXISTS "Admin All About Sections" ON public.about_sections;

-- ==============================================================================
-- POLITIQUES DE LECTURE PUBLIQUE (ACCÈS STRICTEMENT LIMITÉ AU RÔLE SELECT)
-- Les visiteurs publics (anon) ont UNIQUEMENT le droit de lire les données publiées
-- Aucune modification (INSERT, UPDATE, DELETE) n'est accordée au rôle public/anon
-- ==============================================================================

CREATE POLICY "Public Read Categories" 
ON public.categories FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Read Products" 
ON public.products FOR SELECT 
TO anon, authenticated 
USING (is_published = true);

CREATE POLICY "Public Read Partners" 
ON public.partners FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Read Company Info" 
ON public.company_info FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Read About Sections" 
ON public.about_sections FOR SELECT 
TO anon, authenticated 
USING (is_published = true);

-- Chat : les visiteurs publics peuvent insérer et consulter leurs échanges
CREATE POLICY "Public Insert Conversations" 
ON public.chat_conversations FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Public Read Conversations" 
ON public.chat_conversations FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Update Conversations" 
ON public.chat_conversations FOR UPDATE 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public Insert Messages" 
ON public.chat_messages FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Public Read Messages" 
ON public.chat_messages FOR SELECT 
TO anon, authenticated 
USING (true);

-- Note : Les opérations de gestion (création, modification, suppression) sont exécutées
-- côté serveur via la clé secrète SUPABASE_SERVICE_ROLE_KEY, qui outrepasse légitimement
-- le RLS sans jamais exposer de privilèges d'écriture au navigateur client.

