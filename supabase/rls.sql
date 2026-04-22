-- ============================================================
-- MESTERHUB - Row Level Security Policies
-- ============================================================

-- Activare RLS pe toate tabelele
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
-- Oricine poate vedea profiluri (necesar pentru pagina publică)
CREATE POLICY "Profiluri vizibile public" ON profiles
  FOR SELECT USING (TRUE);

-- Utilizatorul poate modifica doar propriul profil
CREATE POLICY "Utilizator modifică propriul profil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Insert gestionat de trigger, nu direct
CREATE POLICY "Profil creat automat" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- SERVICE CATEGORIES - publice, read-only
-- ============================================================
CREATE POLICY "Categorii vizibile public" ON service_categories
  FOR SELECT USING (is_active = TRUE);

-- ============================================================
-- AREAS - publice, read-only
-- ============================================================
CREATE POLICY "Zone vizibile public" ON areas
  FOR SELECT USING (is_active = TRUE);

-- ============================================================
-- PROVIDER PROFILES
-- ============================================================
-- Profiluri publice
CREATE POLICY "Provider profiles vizibile public" ON provider_profiles
  FOR SELECT USING (is_active = TRUE);

-- Prestatorul vede și propriul profil inactiv
CREATE POLICY "Provider vede propriul profil" ON provider_profiles
  FOR SELECT USING (
    is_active = TRUE OR user_id = auth.uid()
  );

-- Prestatorul creează propriul profil
CREATE POLICY "Provider creează propriul profil" ON provider_profiles
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')
  );

-- Prestatorul modifică doar al lui
CREATE POLICY "Provider modifică propriul profil" ON provider_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- PROVIDER SERVICES
-- ============================================================
CREATE POLICY "Servicii vizibile public" ON provider_services
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Provider gestionează propriile servicii" ON provider_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM provider_profiles
      WHERE id = provider_services.provider_id
      AND user_id = auth.uid()
    )
  );

-- ============================================================
-- PROVIDER AREAS
-- ============================================================
CREATE POLICY "Zone provider vizibile public" ON provider_areas
  FOR SELECT USING (TRUE);

CREATE POLICY "Provider gestionează propriile zone" ON provider_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM provider_profiles
      WHERE id = provider_areas.provider_id
      AND user_id = auth.uid()
    )
  );

-- ============================================================
-- PROVIDER PORTFOLIO
-- ============================================================
CREATE POLICY "Portofoliu vizibil public" ON provider_portfolio
  FOR SELECT USING (TRUE);

CREATE POLICY "Provider gestionează propriul portofoliu" ON provider_portfolio
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM provider_profiles
      WHERE id = provider_portfolio.provider_id
      AND user_id = auth.uid()
    )
  );

-- ============================================================
-- REQUESTS
-- ============================================================
-- Clientul vede doar cererile proprii
CREATE POLICY "Client vede propriile cereri" ON requests
  FOR SELECT USING (client_id = auth.uid());

-- Prestatorul vede cererile adresate lui
CREATE POLICY "Provider vede cererile primite" ON requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM provider_profiles
      WHERE id = requests.provider_id
      AND user_id = auth.uid()
    )
  );

-- Clientul creează cereri
CREATE POLICY "Client creează cereri" ON requests
  FOR INSERT WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

-- Clientul poate anula propria cerere
CREATE POLICY "Client actualizează propria cerere" ON requests
  FOR UPDATE USING (client_id = auth.uid());

-- Prestatorul poate schimba statusul
CREATE POLICY "Provider actualizează cererile primite" ON requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM provider_profiles
      WHERE id = requests.provider_id
      AND user_id = auth.uid()
    )
  );

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE POLICY "Participanți văd conversația" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = conversations.request_id
      AND (
        r.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM provider_profiles pp
          WHERE pp.id = r.provider_id AND pp.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Creare conversație la cerere" ON conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = conversations.request_id
      AND (
        r.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM provider_profiles pp
          WHERE pp.id = r.provider_id AND pp.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE POLICY "Participanți văd mesajele" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN requests r ON r.id = c.request_id
      WHERE c.id = messages.conversation_id
      AND (
        r.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM provider_profiles pp
          WHERE pp.id = r.provider_id AND pp.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Participanți trimit mesaje" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN requests r ON r.id = c.request_id
      WHERE c.id = messages.conversation_id
      AND (
        r.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM provider_profiles pp
          WHERE pp.id = r.provider_id AND pp.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE POLICY "Review-uri vizibile public" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Client lasă review" ON reviews
  FOR INSERT WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Client modifică propriul review" ON reviews
  FOR UPDATE USING (client_id = auth.uid());

CREATE POLICY "Client șterge propriul review" ON reviews
  FOR DELETE USING (client_id = auth.uid());

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE POLICY "Client vede propriile favorite" ON favorites
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Client adaugă la favorite" ON favorites
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Client șterge din favorite" ON favorites
  FOR DELETE USING (client_id = auth.uid());
