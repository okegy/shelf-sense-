import { useState } from 'react';
import { Search, Scan } from 'lucide-react';
import { Product } from '../types/index';
import ProductCard from './ProductCard';
import { apiService } from '../services/api';
import { VoiceSearchResult } from '../services/voiceService';
import { useToast } from './ui/ToastProvider';
import VoiceSearchWidget from './VoiceSearchWidget';

interface SearchSectionProps {
  products: Product[];
  onScanBarcode: () => void;
}

export default function SearchSection({ products, onScanBarcode }: SearchSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleVoiceSearchResult = (result: VoiceSearchResult) => {
    setSearchTerm(result.query);
    setSearchResults(result.results);
    addToast(`Voice search: Found ${result.results.length} results for "${result.query}"`, 'success');
  };

  const handleVoiceCommand = (command: string) => {
    addToast(`Voice command: ${command}`, 'info');
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Use API search for better results
      const results = await apiService.searchProducts(searchTerm) as Product[];
      setSearchResults(results);
      addToast(`Found ${results.length} products matching "${searchTerm}"`, 'info');
    } catch (error) {
      // Fallback to local search
      const results = products.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-400" />
          Product Search & Barcode Scanner
        </h2>
        
        {/* Voice Search Widget */}
        <VoiceSearchWidget 
          onSearchResult={handleVoiceSearchResult}
          onCommand={handleVoiceCommand}
          className="ml-4"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 outline-none text-white placeholder-white/50"
          placeholder="Search products by name, barcode, or category..."
        />
        
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl transition-colors duration-200 font-medium flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          {isLoading ? 'Searching...' : 'Search'}
        </button>

        <button
          onClick={onScanBarcode}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors duration-200 font-medium flex items-center gap-2"
          title="Scan barcode"
        >
          <Scan className="w-5 h-5" />
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Search Results ({searchResults.length} found)
          </h3>
          <div className="space-y-4">
            {searchResults.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {searchTerm && searchResults.length === 0 && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-6 text-center">
          <div className="text-orange-300 font-semibold">No products found</div>
          <div className="text-white/70 text-sm mt-1">
            Try searching with different keywords or scan a barcode
          </div>
        </div>
      )}
    </div>
  );
}