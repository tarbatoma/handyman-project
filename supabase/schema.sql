-- ============================================================
-- MESTERHUB - Schema SQL Supabase
-- ============================================================

-- Extensii necesare
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- pentru full-text search

-- ============================================================
-- ENUM-uri
-- ============================================================
CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TYPE request_status AS ENUM ('new', 'in_progress', 'completed', 'rejected');

-- ============================================================
-- PROFILES (utilizatori)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'client',
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT DEFAULT 'București',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICE CATEGORIES
-- ============================================================
CREATE TABLE service_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AREAS (sectoare + cartiere)
-- ============================================================
CREATE TABLE areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'sector', -- 'sector' | 'cartier'
  parent_id UUID REFERENCES areas(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROVIDER PROFILES
-- ============================================================
CREATE TABLE provider_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  long_description TEXT,
  years_experience INT DEFAULT 0,
  starting_price DECIMAL(10, 2),
  response_time TEXT, -- ex: "sub 1 oră", "în aceeași zi"
  website_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROVIDER SERVICES
-- ============================================================
CREATE TABLE provider_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES service_categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_from DECIMAL(10, 2),
  price_to DECIMAL(10, 2),
  price_unit TEXT DEFAULT 'proiect', -- 'oră', 'zi', 'mp', 'proiect'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROVIDER AREAS (zone de activitate)
-- ============================================================
CREATE TABLE provider_areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  area_id UUID REFERENCES areas(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, area_id)
);

-- ============================================================
-- PROVIDER PORTFOLIO
-- ============================================================
CREATE TABLE provider_portfolio (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REQUESTS (cereri)
-- ============================================================
CREATE TABLE requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  area_id UUID REFERENCES areas(id),
  budget DECIMAL(10, 2),
  client_phone TEXT,
  status request_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, client_id, request_id)
);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, provider_id)
);

-- ============================================================
-- INDECȘI pentru performanță
-- ============================================================
CREATE INDEX idx_provider_profiles_slug ON provider_profiles(slug);
CREATE INDEX idx_provider_profiles_is_active ON provider_profiles(is_active);
CREATE INDEX idx_provider_profiles_average_rating ON provider_profiles(average_rating DESC);
CREATE INDEX idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX idx_provider_services_category_id ON provider_services(category_id);
CREATE INDEX idx_provider_areas_provider_id ON provider_areas(provider_id);
CREATE INDEX idx_provider_areas_area_id ON provider_areas(area_id);
CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_provider_id ON requests(provider_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_favorites_client_id ON favorites(client_id);

-- Full-text search pe provider
CREATE INDEX idx_provider_profiles_search ON provider_profiles 
  USING GIN(to_tsvector('romanian', COALESCE(business_name, '') || ' ' || COALESCE(short_description, '')));

-- ============================================================
-- FUNCȚII AUTOMATE
-- ============================================================

-- Creare profil automat la înregistrare
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Actualizare updated_at automat
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_provider_profiles_updated_at
  BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Actualizare rating mediu pe provider după fiecare review
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE provider_profiles
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
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

CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
