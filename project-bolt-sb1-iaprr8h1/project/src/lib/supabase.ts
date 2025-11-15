import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ShoppingItem {
  id: string;
  item_name: string;
  quantity: number;
  category: string;
  brand?: string;
  price_range?: string;
  status: 'active' | 'completed' | 'removed';
  added_via: 'voice' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface ShoppingHistory {
  id: string;
  item_name: string;
  category: string;
  purchase_count: number;
  last_purchased: string;
  average_frequency_days: number;
  created_at: string;
}

export interface VoiceCommand {
  id: string;
  command_text: string;
  intent?: string;
  extracted_item?: string;
  extracted_quantity?: number;
  language: string;
  success: boolean;
  created_at: string;
}

export interface ProductCatalog {
  id: string;
  product_name: string;
  category: string;
  brand?: string;
  price?: number;
  seasonal: boolean;
  season?: string;
  alternatives?: string[];
  created_at: string;
}
