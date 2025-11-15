import { Check, X, Minus, Plus } from 'lucide-react';
import { ShoppingItem } from '../lib/supabase';

interface ShoppingListItemProps {
  item: ShoppingItem;
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
}

export function ShoppingListItem({ item, onComplete, onRemove, onQuantityChange }: ShoppingListItemProps) {
  const categoryColors: Record<string, string> = {
    dairy: 'bg-yellow-100 text-yellow-800',
    produce: 'bg-green-100 text-green-800',
    meat: 'bg-red-100 text-red-800',
    bakery: 'bg-orange-100 text-orange-800',
    beverages: 'bg-blue-100 text-blue-800',
    snacks: 'bg-purple-100 text-purple-800',
    household: 'bg-gray-100 text-gray-800',
    personal_care: 'bg-pink-100 text-pink-800',
    general: 'bg-slate-100 text-slate-800'
  };

  const categoryColor = categoryColors[item.category] || categoryColors.general;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {item.item_name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
              {item.category}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-medium min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {item.brand && (
              <span className="text-gray-500">Brand: {item.brand}</span>
            )}

            {item.price_range && (
              <span className="text-gray-500">
                Price: {item.price_range.replace('_', ' ')}
              </span>
            )}

            <span className={`text-xs px-2 py-0.5 rounded ${
              item.added_via === 'voice' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
            }`}>
              {item.added_via === 'voice' ? 'Voice' : 'Manual'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onComplete(item.id)}
            className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
            title="Mark as complete"
          >
            <Check className="w-5 h-5" />
          </button>

          <button
            onClick={() => onRemove(item.id)}
            className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
            title="Remove item"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
