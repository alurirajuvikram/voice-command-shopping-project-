export interface ParsedCommand {
  intent: 'add' | 'remove' | 'search' | 'clear' | 'complete' | 'unknown';
  itemName: string | null;
  quantity: number;
  brand: string | null;
  priceRange: string | null;
  category: string | null;
}

const ADD_KEYWORDS = ['add', 'need', 'want', 'buy', 'get', 'purchase', 'i need', 'i want'];
const REMOVE_KEYWORDS = ['remove', 'delete', 'take off', 'cancel', 'drop'];
const SEARCH_KEYWORDS = ['find', 'search', 'look for', 'show me'];
const CLEAR_KEYWORDS = ['clear', 'empty', 'delete all', 'remove all'];
const COMPLETE_KEYWORDS = ['bought', 'purchased', 'got', 'completed', 'done with'];

const CATEGORIES: Record<string, string[]> = {
  dairy: ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'ice cream'],
  produce: ['apple', 'banana', 'orange', 'tomato', 'lettuce', 'carrot', 'potato', 'onion', 'fruit', 'vegetable'],
  meat: ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 'meat'],
  bakery: ['bread', 'bagel', 'muffin', 'cake', 'cookie', 'pastry'],
  beverages: ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine'],
  snacks: ['chips', 'crackers', 'popcorn', 'nuts', 'candy', 'chocolate'],
  household: ['soap', 'detergent', 'paper towels', 'toilet paper', 'cleaner'],
  personal_care: ['toothpaste', 'shampoo', 'deodorant', 'soap', 'lotion']
};

export class NLPParser {
  parseCommand(text: string): ParsedCommand {
    const lowerText = text.toLowerCase().trim();

    const result: ParsedCommand = {
      intent: 'unknown',
      itemName: null,
      quantity: 1,
      brand: null,
      priceRange: null,
      category: null
    };

    result.intent = this.detectIntent(lowerText);

    if (result.intent === 'add' || result.intent === 'search' || result.intent === 'remove' || result.intent === 'complete') {
      result.quantity = this.extractQuantity(lowerText);
      result.itemName = this.extractItemName(lowerText, result.intent);
      result.brand = this.extractBrand(lowerText);
      result.priceRange = this.extractPriceRange(lowerText);

      if (result.itemName) {
        result.category = this.categorizeItem(result.itemName);
      }
    }

    return result;
  }

  private detectIntent(text: string): ParsedCommand['intent'] {
    if (CLEAR_KEYWORDS.some(kw => text.includes(kw))) return 'clear';
    if (COMPLETE_KEYWORDS.some(kw => text.includes(kw))) return 'complete';
    if (REMOVE_KEYWORDS.some(kw => text.includes(kw))) return 'remove';
    if (SEARCH_KEYWORDS.some(kw => text.includes(kw))) return 'search';
    if (ADD_KEYWORDS.some(kw => text.includes(kw))) return 'add';

    return 'add';
  }

  private extractQuantity(text: string): number {
    const numberWords: Record<string, number> = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'a': 1, 'an': 1
    };

    for (const [word, num] of Object.entries(numberWords)) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(text)) {
        return num;
      }
    }

    const numMatch = text.match(/\b(\d+)\b/);
    if (numMatch) {
      return parseInt(numMatch[1], 10);
    }

    return 1;
  }

  private extractItemName(text: string, intent: string): string | null {
    let cleaned = text;

    [...ADD_KEYWORDS, ...REMOVE_KEYWORDS, ...SEARCH_KEYWORDS, ...COMPLETE_KEYWORDS].forEach(kw => {
      cleaned = cleaned.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
    });

    cleaned = cleaned.replace(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an)\b/gi, '');
    cleaned = cleaned.replace(/\b(bottles?|cans?|boxes?|bags?|items?|of)\b/gi, '');
    cleaned = cleaned.replace(/\b(to|my|the|from|list)\b/gi, '');
    cleaned = cleaned.replace(/\bunder\s+\$\d+\b/gi, '');
    cleaned = cleaned.replace(/\bless than\s+\$\d+\b/gi, '');

    cleaned = cleaned.trim();

    if (cleaned.length === 0) return null;

    return cleaned;
  }

  private extractBrand(text: string): string | null {
    const brandIndicators = ['brand', 'by'];
    for (const indicator of brandIndicators) {
      const regex = new RegExp(`${indicator}\\s+([\\w\\s]+?)(?:\\s|$)`, 'i');
      const match = text.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  private extractPriceRange(text: string): string | null {
    const priceMatch = text.match(/under\s+\$?(\d+)|less than\s+\$?(\d+)|below\s+\$?(\d+)/i);
    if (priceMatch) {
      const price = priceMatch[1] || priceMatch[2] || priceMatch[3];
      return `under_${price}`;
    }
    return null;
  }

  private categorizeItem(itemName: string): string {
    const lowerItem = itemName.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORIES)) {
      if (keywords.some(keyword => lowerItem.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }
}

export const nlpParser = new NLPParser();
