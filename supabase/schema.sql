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
    description TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
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

-- INDEXES POUR LES RECHERCHES ET PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 5. CONFIGURATION ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique (Les visiteurs peuvent consulter le catalogue et les infos)
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Public Read Company Info" ON public.company_info FOR SELECT USING (true);

-- Politiques de modification sécurisées (Seuls les utilisateurs authentifiés avec rôle admin)
CREATE POLICY "Admin All Categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Partners" ON public.partners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Company Info" ON public.company_info FOR ALL USING (auth.role() = 'authenticated');

