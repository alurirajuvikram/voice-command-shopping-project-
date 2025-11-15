-- Voice Command Shopping Assistant Schema
-- Creates database structure for voice-activated shopping list manager with smart suggestions
--
-- New Tables:
-- 1. shopping_items - Main shopping list items
-- 2. shopping_history - Purchase history for smart suggestions
-- 3. voice_commands - Voice command logs for NLP improvement
-- 4. product_catalog - Product database for search and suggestions

CREATE TABLE IF NOT EXISTS shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  quantity integer DEFAULT 1,
  category text DEFAULT 'general',
  brand text,
  price_range text,
  status text DEFAULT 'active',
  added_via text DEFAULT 'voice',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shopping_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  category text DEFAULT 'general',
  purchase_count integer DEFAULT 1,
  last_purchased timestamptz DEFAULT now(),
  average_frequency_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS voice_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  command_text text NOT NULL,
  intent text,
  extracted_item text,
  extracted_quantity integer,
  language text DEFAULT 'en-US',
  success boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  category text NOT NULL,
  brand text,
  price numeric,
  seasonal boolean DEFAULT false,
  season text,
  alternatives text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view shopping items"
  ON shopping_items FOR SELECT
  USING (true);

CREATE POLICY "Public can insert shopping items"
  ON shopping_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update shopping items"
  ON shopping_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete shopping items"
  ON shopping_items FOR DELETE
  USING (true);

CREATE POLICY "Public can view shopping history"
  ON shopping_history FOR SELECT
  USING (true);

CREATE POLICY "Public can insert shopping history"
  ON shopping_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update shopping history"
  ON shopping_history FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view voice commands"
  ON voice_commands FOR SELECT
  USING (true);

CREATE POLICY "Public can insert voice commands"
  ON voice_commands FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view product catalog"
  ON product_catalog FOR SELECT
  USING (true);

CREATE POLICY "Public can insert product catalog"
  ON product_catalog FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_shopping_items_status ON shopping_items(status);
CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON shopping_items(category);
CREATE INDEX IF NOT EXISTS idx_shopping_history_item_name ON shopping_history(item_name);
CREATE INDEX IF NOT EXISTS idx_product_catalog_category ON product_catalog(category);
CREATE INDEX IF NOT EXISTS idx_product_catalog_name ON product_catalog(product_name);