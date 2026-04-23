-- ============================================================
-- MESTERHUB - Enterprise Schema SQL Supabase (OLX Style)
-- ============================================================

-- Extensii necesare
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- pentru full-text search

-- ============================================================
-- CURĂȚARE BAZĂ DE DATE VECHE (pentru a evita erori de "already exists")
-- ============================================================

-- Drop triggere și funcții vechi
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_provider_rating() CASCADE;

-- Drop tabele vechi (cu CASCADE pentru dependințe)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS ad_favorites CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS service_ads CASCADE;
DROP TABLE IF EXISTS provider_portfolio CASCADE;
DROP TABLE IF EXISTS provider_areas CASCADE;
DROP TABLE IF EXISTS provider_services CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS provider_profiles CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS areas CASCADE;

-- Drop ENUMs vechi
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS ad_status CASCADE;
DROP TYPE IF EXISTS price_type CASCADE;
DROP TYPE IF EXISTS provider_type CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- ============================================================
-- ENUM-uri NOI
-- ============================================================
CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TYPE ad_status AS ENUM ('active', 'paused', 'pending_review', 'rejected', 'deleted');
CREATE TYPE price_type AS ENUM ('fixed', 'negotiable', 'starting_from', 'free', 'hourly');
CREATE TYPE provider_type AS ENUM ('individual', 'pfa', 'srl');
CREATE TYPE request_status AS ENUM ('new', 'in_progress', 'completed', 'rejected');

-- ============================================================
-- AREAS (Sectoare, Județe, Localități, Cartiere)
-- ============================================================
CREATE TABLE areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'city', -- 'county', 'city', 'sector', 'neighborhood'
  parent_id UUID REFERENCES areas(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES (Utilizatori Bază)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'client',
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  location_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICE CATEGORIES (Cu Sub-categorii și Schemă Dinamică)
-- ============================================================
CREATE TABLE service_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  -- Schema JSON pentru a dicta ce filtre extra are categoria (ex: { "fields": [ { "name": "has_warranty", "type": "boolean", "label": "Oferă garanție" } ] })
  dynamic_attributes_schema JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROVIDER PROFILES (Date Extinse Meseriași/Firme)
-- ============================================================
CREATE TABLE provider_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  provider_type provider_type DEFAULT 'individual',
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cui TEXT, -- Cod Unic Înregistrare (pt SRL/PFA)
  reg_com TEXT, -- J-ul (pt SRL/PFA)
  short_description TEXT,
  long_description TEXT,
  website_url TEXT,
  cover_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE, -- Identitate/Firma verificată
  response_rate INT DEFAULT 100, -- Procentaj de mesaje la care a răspuns
  avg_response_time TEXT, -- ex: "sub o oră"
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICE ADS (ANUNȚURILE - Miezul Platformei)
-- ============================================================
CREATE TABLE service_ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES service_categories(id) ON DELETE RESTRICT NOT NULL,
  location_id UUID REFERENCES areas(id) ON DELETE RESTRICT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}', -- Până la 8 URL-uri
  price DECIMAL(10, 2),
  price_type price_type DEFAULT 'fixed',
  currency TEXT DEFAULT 'RON',
  -- Atribute specifice categoriei completate la crearea anunțului
  attributes JSONB DEFAULT '{}'::jsonb, 
  status ad_status DEFAULT 'active',
  views_count INT DEFAULT 0,
  phone_views_count INT DEFAULT 0, -- De câte ori s-a apăsat pe "Afișează numărul"
  promoted_until TIMESTAMPTZ, -- Dacă anunțul e promovat (Premium)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- ============================================================
-- FAVORITES (Anunțuri Salvate)
-- ============================================================
CREATE TABLE ad_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES service_ads(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, ad_id)
);

-- ============================================================
-- CONVERSATIONS (Legate de un Anunț)
-- ============================================================
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES service_ads(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ad_id, client_id) -- O conversație per anunț per client
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS (Recenzii pe Prestator, opțional legate de un Anunț)
-- ============================================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES service_ads(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, client_id, ad_id)
);

-- ============================================================
-- REPORTS (Raportare Anunțuri / Spam)
-- ============================================================
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ad_id UUID REFERENCES service_ads(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDECȘI PENTRU PERFORMANȚĂ EXTREMĂ (OLX Scale)
-- ============================================================
CREATE INDEX idx_service_ads_provider_id ON service_ads(provider_id);
CREATE INDEX idx_service_ads_category_id ON service_ads(category_id);
CREATE INDEX idx_service_ads_location_id ON service_ads(location_id);
CREATE INDEX idx_service_ads_status ON service_ads(status);
CREATE INDEX idx_service_ads_price ON service_ads(price);
CREATE INDEX idx_service_ads_created_at ON service_ads(created_at DESC);
CREATE INDEX idx_service_ads_attributes ON service_ads USING GIN (attributes); -- Esențial pentru filtre JSON dinamice!

-- Full-text search avansat pe Anunțuri (Căutare tip "Instalator ieftin")
CREATE INDEX idx_service_ads_search ON service_ads 
  USING GIN(to_tsvector('romanian', COALESCE(title, '') || ' ' || COALESCE(description, '')));

CREATE INDEX idx_provider_profiles_slug ON provider_profiles(slug);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_ad_favorites_client_id ON ad_favorites(client_id);

-- ============================================================
-- FUNCȚII AUTOMATE & TRIGGERE
-- ============================================================

-- Creare profil automat la înregistrare
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funcție generică de update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_provider_profiles_updated_at
  BEFORE UPDATE ON provider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_ads_updated_at
  BEFORE UPDATE ON service_ads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Actualizare rating mediu pe provider după fiecare review
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE provider_profiles
  SET 
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)
      FROM reviews
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
    )
  WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_rating_on_review_insert AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
CREATE TRIGGER update_rating_on_review_delete AFTER DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
CREATE TRIGGER update_rating_on_review_update AFTER UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- ============================================================
-- POLICIES (RLS - Row Level Security)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_favorites ENABLE ROW LEVEL SECURITY;

-- Vizibilitate publică pentru catalog
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Provider profiles viewable by everyone" ON provider_profiles FOR SELECT USING (true);
CREATE POLICY "Active ads viewable by everyone" ON service_ads FOR SELECT USING (status = 'active');
CREATE POLICY "Categories viewable by everyone" ON service_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Areas viewable by everyone" ON areas FOR SELECT USING (is_active = true);

-- Userii își pot edita doar datele proprii
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Providers can update own profile" ON provider_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Providers can insert own profile" ON provider_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Userii își pot administra anunțurile
CREATE POLICY "Providers can manage own ads" ON service_ads FOR ALL USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- Favorite
CREATE POLICY "Clients can manage own favorites" ON ad_favorites FOR ALL USING (client_id = auth.uid());
