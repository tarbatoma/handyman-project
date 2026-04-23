-- ============================================================
-- MESTERHUB - Enterprise Seed Data
-- ============================================================

-- ============================================================
-- ZONE (București & Ilfov)
-- ============================================================
INSERT INTO areas (name, slug, type) VALUES
  ('Sector 1', 'sector-1', 'sector'),
  ('Sector 2', 'sector-2', 'sector'),
  ('Sector 3', 'sector-3', 'sector'),
  ('Sector 4', 'sector-4', 'sector'),
  ('Sector 5', 'sector-5', 'sector'),
  ('Sector 6', 'sector-6', 'sector'),
  ('Ilfov', 'ilfov', 'county'),
  ('Cluj-Napoca', 'cluj-napoca', 'city')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- CATEGORII SERVICII & ATRIBUTE DINAMICE
-- ============================================================
INSERT INTO service_categories (name, slug, icon, sort_order, dynamic_attributes_schema) VALUES
  ('Zugrav', 'zugrav', '🎨', 1, '{
    "fields": [
      {"name": "material_included", "type": "boolean", "label": "Materiale incluse în preț"},
      {"name": "offers_cleaning", "type": "boolean", "label": "Curățenie după lucrare"}
    ]
  }'::jsonb),
  
  ('Instalator', 'instalator', '🔧', 2, '{
    "fields": [
      {"name": "emergency_247", "type": "boolean", "label": "Intervenții urgențe 24/7"},
      {"name": "free_quote", "type": "boolean", "label": "Constatare gratuită"},
      {"name": "warranty_months", "type": "number", "label": "Luni Garanție", "placeholder": "Ex: 12"}
    ]
  }'::jsonb),
  
  ('Electrician', 'electrician', '⚡', 3, '{
    "fields": [
      {"name": "authorized_anre", "type": "boolean", "label": "Autorizat ANRE"},
      {"name": "emergency_247", "type": "boolean", "label": "Intervenții Non-Stop"}
    ]
  }'::jsonb),
  
  ('Montaj mobilă', 'montaj-mobila', '🪑', 4, '{
    "fields": [
      {"name": "ikea_specialist", "type": "boolean", "label": "Specialist IKEA/Dedeman"},
      {"name": "transport_included", "type": "boolean", "label": "Ofer transport mobilă"}
    ]
  }'::jsonb),
  
  ('Curățenie', 'curatenie', '🧹', 5, '{
    "fields": [
      {"name": "eco_products", "type": "boolean", "label": "Folosește produse Eco/Bio"},
      {"name": "brings_equipment", "type": "boolean", "label": "Vine cu echipamente proprii (Aspirator etc.)"}
    ]
  }'::jsonb),
  
  ('Gresie / Faianță', 'gresie-faianta', '🏗️', 6, '{}'::jsonb),
  ('Reparații diverse', 'reparatii-diverse', '🛠️', 7, '{}'::jsonb),
  ('Amenajări interioare', 'amenajari-interioare', '🏠', 8, '{}'::jsonb),
  ('Transport / Mutări', 'transport-mutari', '🚛', 9, '{
    "fields": [
      {"name": "has_porters", "type": "boolean", "label": "Include manipulanți marfă"},
      {"name": "international", "type": "boolean", "label": "Curse internaționale"}
    ]
  }'::jsonb),
  ('Tâmplărie', 'tamplarie', '🪚', 10, '{}'::jsonb),
  ('Aer condiționat', 'aer-conditionat', '❄️', 11, '{
    "fields": [
      {"name": "freon_charge", "type": "boolean", "label": "Încărcare Freon inclusă"},
      {"name": "certified", "type": "boolean", "label": "Certificat AGFR"}
    ]
  }'::jsonb),
  ('Centrale termice', 'centrale-termice', '🔥', 12, '{
    "fields": [
      {"name": "authorized_iscir", "type": "boolean", "label": "Autorizat ISCIR"}
    ]
  }'::jsonb)
ON CONFLICT (slug) DO NOTHING;
