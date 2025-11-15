import { Plus, Lightbulb } from 'lucide-react';
import { Suggestion } from '../services/smartSuggestions';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAdd: (itemName: string, category: string) => void;
}

export function SuggestionCard({ suggestion, onAdd }: SuggestionCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 capitalize mb-1">
            {suggestion.itemName}
          </h4>
          <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>

          {suggestion.alternatives && suggestion.alternatives.length > 0 && (
            <div className="text-xs text-gray-500 mb-2">
              Alternatives: {suggestion.alternatives.join(', ')}
            </div>
          )}

          <button
            onClick={() => onAdd(suggestion.itemName, suggestion.category)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add to list
          </button>
        </div>
      </div>
    </div>
  );
}
