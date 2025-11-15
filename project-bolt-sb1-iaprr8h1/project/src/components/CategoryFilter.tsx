import { Filter } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  categories: string[];
  itemCounts: Record<string, number>;
}

export function CategoryFilter({ selectedCategory, onSelectCategory, categories, itemCounts }: CategoryFilterProps) {
  const allCount = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filter by Category</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${selectedCategory === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          All ({allCount})
        </button>

        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize
              ${selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {category} ({itemCounts[category] || 0})
          </button>
        ))}
      </div>
    </div>
  );
}
