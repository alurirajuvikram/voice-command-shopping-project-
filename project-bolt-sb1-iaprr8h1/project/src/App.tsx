import { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { VoiceButton } from './components/VoiceButton';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { ShoppingListItem } from './components/ShoppingListItem';
import { SuggestionCard } from './components/SuggestionCard';
import { CategoryFilter } from './components/CategoryFilter';
import { LanguageSelector } from './components/LanguageSelector';
import { voiceRecognitionService } from './services/voiceRecognition';
import { nlpParser } from './services/nlpParser';
import { shoppingListService } from './services/shoppingListService';
import { smartSuggestionsService } from './services/smartSuggestions';
import { supabase, ShoppingItem } from './lib/supabase';
import type { Suggestion } from './services/smartSuggestions';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isFinalTranscript, setIsFinalTranscript] = useState(false);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  useEffect(() => {
    loadItems();
    loadSuggestions();

    const subscription = supabase
      .channel('shopping_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, () => {
        loadItems();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadItems = async () => {
    const fetchedItems = await shoppingListService.getActiveItems();
    setItems(fetchedItems);
  };

  const loadSuggestions = async () => {
    const fetchedSuggestions = await smartSuggestionsService.getSmartSuggestions();
    setSuggestions(fetchedSuggestions);
  };

  const handleVoiceToggle = () => {
    if (!voiceRecognitionService.isSupported()) {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      voiceRecognitionService.stopListening();
      setIsListening(false);
      setTranscript('');
      setIsFinalTranscript(false);
    } else {
      voiceRecognitionService.setLanguage(selectedLanguage);
      const started = voiceRecognitionService.startListening(
        (text, isFinal) => {
          setTranscript(text);
          setIsFinalTranscript(isFinal);

          if (isFinal) {
            processVoiceCommand(text);
            setTimeout(() => {
              setTranscript('');
              setIsFinalTranscript(false);
            }, 3000);
          }
        },
        (error) => {
          setError(`Voice recognition error: ${error}`);
          setIsListening(false);
        }
      );

      if (started) {
        setIsListening(true);
        setError(null);
      }
    }
  };

  const processVoiceCommand = async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      const command = nlpParser.parseCommand(text);

      await supabase.from('voice_commands').insert({
        command_text: text,
        intent: command.intent,
        extracted_item: command.itemName,
        extracted_quantity: command.quantity,
        language: selectedLanguage,
        success: true
      });

      switch (command.intent) {
        case 'add':
          if (command.itemName) {
            await shoppingListService.addItem(
              command.itemName,
              command.quantity,
              command.category || 'general',
              command.brand || undefined,
              command.priceRange || undefined,
              'voice'
            );
            setSuccessMessage(`Added ${command.quantity} ${command.itemName} to your list`);
            loadItems();
            loadSuggestions();
          } else {
            setError('Could not identify the item to add');
          }
          break;

        case 'remove':
          if (command.itemName) {
            await shoppingListService.removeItemByName(command.itemName);
            setSuccessMessage(`Removed ${command.itemName} from your list`);
            loadItems();
          } else {
            setError('Could not identify the item to remove');
          }
          break;

        case 'complete':
          if (command.itemName) {
            await shoppingListService.completeItemByName(command.itemName);
            await smartSuggestionsService.updatePurchaseHistory(
              command.itemName,
              command.category || 'general'
            );
            setSuccessMessage(`Marked ${command.itemName} as purchased`);
            loadItems();
          } else {
            setError('Could not identify the item to complete');
          }
          break;

        case 'clear':
          await shoppingListService.clearList();
          setSuccessMessage('Cleared your shopping list');
          loadItems();
          break;

        case 'search':
          if (command.itemName) {
            const results = await shoppingListService.searchItems(
              command.itemName,
              command.priceRange || undefined
            );
            setItems(results);
            setSuccessMessage(`Found ${results.length} items`);
          }
          break;

        default:
          setError('Could not understand the command. Try saying "Add milk" or "Remove bread"');
      }
    } catch (err) {
      console.error('Error processing command:', err);
      setError('Failed to process command');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleCompleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      await shoppingListService.completeItem(id);
      await smartSuggestionsService.updatePurchaseHistory(item.item_name, item.category);
      loadItems();
      setSuccessMessage('Item marked as purchased');
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const handleRemoveItem = async (id: string) => {
    await shoppingListService.removeItem(id);
    loadItems();
    setSuccessMessage('Item removed');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleQuantityChange = async (id: string, quantity: number) => {
    await shoppingListService.updateQuantity(id, quantity);
    loadItems();
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all items?')) {
      await shoppingListService.clearList();
      loadItems();
      setSuccessMessage('List cleared');
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const handleAddSuggestion = async (itemName: string, category: string) => {
    await shoppingListService.addItem(itemName, 1, category, undefined, undefined, 'manual');
    loadItems();
    setSuccessMessage(`Added ${itemName} to your list`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const categories = Array.from(new Set(items.map(item => item.category)));
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredItems = selectedCategory
    ? items.filter(item => item.category === selectedCategory)
    : items;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShoppingBag className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Voice Shopping Assistant</h1>
          </div>
          <p className="text-gray-600">Manage your shopping list with voice commands</p>
        </header>

        <div className="mb-6 flex justify-center gap-4">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        </div>

        <div className="flex flex-col items-center gap-6 mb-8">
          <VoiceButton
            isListening={isListening}
            onToggle={handleVoiceToggle}
            disabled={loading}
          />

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">
              {isListening ? 'Listening for commands...' : 'Tap to start voice commands'}
            </p>
            <p className="text-xs text-gray-500">
              Try: "Add milk", "Remove bread", "I need 3 apples"
            </p>
          </div>

          {transcript && (
            <div className="w-full max-w-2xl">
              <TranscriptDisplay transcript={transcript} isFinal={isFinalTranscript} />
            </div>
          )}

          {error && (
            <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="w-full max-w-2xl bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-green-800 text-sm font-medium">{successMessage}</p>
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Smart Suggestions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAdd={handleAddSuggestion}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Shopping List ({filteredItems.length})
            </h2>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          {categories.length > 0 && (
            <div className="mb-4">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categories={categories}
                itemCounts={categoryCounts}
              />
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Processing...</p>
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Your shopping list is empty</p>
            <p className="text-gray-500 text-sm">
              Use voice commands or check out the suggestions above
            </p>
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <ShoppingListItem
                key={item.id}
                item={item}
                onComplete={handleCompleteItem}
                onRemove={handleRemoveItem}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
