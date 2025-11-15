import { supabase, ShoppingItem } from '../lib/supabase';

export class ShoppingListService {
  async addItem(
    itemName: string,
    quantity: number,
    category: string,
    brand?: string,
    priceRange?: string,
    addedVia: 'voice' | 'manual' = 'voice'
  ): Promise<ShoppingItem | null> {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .insert({
          item_name: itemName,
          quantity: quantity,
          category: category,
          brand: brand,
          price_range: priceRange,
          status: 'active',
          added_via: addedVia
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding item:', error);
      return null;
    }
  }

  async getActiveItems(): Promise<ShoppingItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting items:', error);
      return [];
    }
  }

  async removeItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ status: 'removed' })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }

  async removeItemByName(itemName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ status: 'removed' })
        .eq('status', 'active')
        .ilike('item_name', `%${itemName}%`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing item by name:', error);
      return false;
    }
  }

  async completeItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing item:', error);
      return false;
    }
  }

  async completeItemByName(itemName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ status: 'completed' })
        .eq('status', 'active')
        .ilike('item_name', `%${itemName}%`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing item by name:', error);
      return false;
    }
  }

  async updateQuantity(id: string, quantity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ quantity: quantity, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  }

  async clearList(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ status: 'removed' })
        .eq('status', 'active');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing list:', error);
      return false;
    }
  }

  async searchItems(query: string, priceRange?: string): Promise<ShoppingItem[]> {
    try {
      let queryBuilder = supabase
        .from('shopping_items')
        .select('*')
        .eq('status', 'active')
        .ilike('item_name', `%${query}%`);

      if (priceRange) {
        queryBuilder = queryBuilder.eq('price_range', priceRange);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  async getItemsByCategory(category: string): Promise<ShoppingItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('status', 'active')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting items by category:', error);
      return [];
    }
  }
}

export const shoppingListService = new ShoppingListService();
