import { supabase, ShoppingHistory, ProductCatalog } from '../lib/supabase';

export interface Suggestion {
  id: string;
  itemName: string;
  reason: string;
  category: string;
  alternatives?: string[];
}

export class SmartSuggestionsService {
  async getSmartSuggestions(): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    const historySuggestions = await this.getHistoryBasedSuggestions();
    suggestions.push(...historySuggestions);

    const seasonalSuggestions = await this.getSeasonalSuggestions();
    suggestions.push(...seasonalSuggestions);

    return suggestions.slice(0, 5);
  }

  private async getHistoryBasedSuggestions(): Promise<Suggestion[]> {
    try {
      const { data: history, error } = await supabase
        .from('shopping_history')
        .select('*')
        .order('purchase_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      const suggestions: Suggestion[] = [];
      const currentDate = new Date();

      for (const item of history || []) {
        const daysSinceLastPurchase = Math.floor(
          (currentDate.getTime() - new Date(item.last_purchased).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (item.average_frequency_days > 0 && daysSinceLastPurchase >= item.average_frequency_days) {
          suggestions.push({
            id: item.id,
            itemName: item.item_name,
            reason: `You usually buy this every ${item.average_frequency_days} days`,
            category: item.category
          });
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting history suggestions:', error);
      return [];
    }
  }

  private async getSeasonalSuggestions(): Promise<Suggestion[]> {
    try {
      const currentMonth = new Date().getMonth();
      let season = 'spring';

      if (currentMonth >= 2 && currentMonth <= 4) season = 'spring';
      else if (currentMonth >= 5 && currentMonth <= 7) season = 'summer';
      else if (currentMonth >= 8 && currentMonth <= 10) season = 'fall';
      else season = 'winter';

      const { data: products, error } = await supabase
        .from('product_catalog')
        .select('*')
        .eq('seasonal', true)
        .eq('season', season)
        .limit(3);

      if (error) throw error;

      return (products || []).map(product => ({
        id: product.id,
        itemName: product.product_name,
        reason: `${season} seasonal item`,
        category: product.category,
        alternatives: product.alternatives
      }));
    } catch (error) {
      console.error('Error getting seasonal suggestions:', error);
      return [];
    }
  }

  async findAlternatives(itemName: string): Promise<string[]> {
    try {
      const { data: product, error } = await supabase
        .from('product_catalog')
        .select('alternatives')
        .ilike('product_name', `%${itemName}%`)
        .maybeSingle();

      if (error) throw error;

      return product?.alternatives || [];
    } catch (error) {
      console.error('Error finding alternatives:', error);
      return [];
    }
  }

  async updatePurchaseHistory(itemName: string, category: string) {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('shopping_history')
        .select('*')
        .eq('item_name', itemName)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        const daysSinceLastPurchase = Math.floor(
          (new Date().getTime() - new Date(existing.last_purchased).getTime()) / (1000 * 60 * 60 * 24)
        );

        const newAverageFrequency = Math.round(
          (existing.average_frequency_days * existing.purchase_count + daysSinceLastPurchase) /
          (existing.purchase_count + 1)
        );

        const { error: updateError } = await supabase
          .from('shopping_history')
          .update({
            purchase_count: existing.purchase_count + 1,
            last_purchased: new Date().toISOString(),
            average_frequency_days: newAverageFrequency
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('shopping_history')
          .insert({
            item_name: itemName,
            category: category,
            purchase_count: 1,
            last_purchased: new Date().toISOString(),
            average_frequency_days: 0
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating purchase history:', error);
    }
  }
}

export const smartSuggestionsService = new SmartSuggestionsService();
