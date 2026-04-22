-- ============================================================
-- MESTERHUB - Seed Data
-- ============================================================

-- Categorii de servicii
INSERT INTO service_categories (name, slug, icon, sort_order) VALUES
  ('Zugrav', 'zugrav', '🎨', 1),
  ('Instalator', 'instalator', '🔧', 2),
  ('Electrician', 'electrician', '⚡', 3),
  ('Montaj mobilă', 'montaj-mobila', '🪑', 4),
  ('Curățenie', 'curatenie', '🧹', 5),
  ('Gresie / Faianță', 'gresie-faianta', '🏗️', 6),
  ('Reparații diverse', 'reparatii-diverse', '🛠️', 7),
  ('Amenajări interioare', 'amenajari-interioare', '🏠', 8),
  ('Transport / Mutări', 'transport-mutari', '🚛', 9),
  ('Tâmplărie', 'tamplarie', '🪚', 10),
  ('Aer condiționat', 'aer-conditionat', '❄️', 11),
  ('Centrale termice', 'centrale-termice', '🔥', 12)
ON CONFLICT (slug) DO NOTHING;

-- Zone București
INSERT INTO areas (name, slug, type) VALUES
  ('Sector 1', 'sector-1', 'sector'),
  ('Sector 2', 'sector-2', 'sector'),
  ('Sector 3', 'sector-3', 'sector'),
  ('Sector 4', 'sector-4', 'sector'),
  ('Sector 5', 'sector-5', 'sector'),
  ('Sector 6', 'sector-6', 'sector'),
  ('Ilfov', 'ilfov', 'judet')
ON CONFLICT (slug) DO NOTHING;
