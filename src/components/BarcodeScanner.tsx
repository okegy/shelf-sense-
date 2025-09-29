import { useState, useEffect, useRef } from 'react';
import { Camera, X, Package, Plus, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Product } from '../types/index';
import { apiService } from '../services/api';
import { useToast } from './ui/ToastProvider';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound?: (product: Product) => void;
  mode?: 'search' | 'add' | 'sale';
}

export default function BarcodeScanner({ isOpen, onClose, onProductFound, mode = 'search' }: BarcodeScannerProps) {
  const [scannedCode, setScannedCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Fruits',
    price: '',
    count: '',
    expiry: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleBarcodeInput = async (barcode: string) => {
    if (!barcode.trim()) return;
    
    setIsLoading(true);
    setFoundProduct(null);
    
    try {
      // Search for existing product with this barcode
      const products = await apiService.getProducts();
      const existingProduct = Array.isArray(products) 
        ? products.find((p: Product) => p.barcode === barcode.trim())
        : null;

      if (existingProduct) {
        setFoundProduct(existingProduct);
        addToast(`Product found: ${existingProduct.name}`, 'success');
        
        if (onProductFound) {
          onProductFound(existingProduct);
        }
      } else {
        // Product not found
        if (mode === 'add') {
          setShowAddForm(true);
          setNewProductForm(prev => ({ ...prev, barcode }));
          addToast('Product not found. You can add it now.', 'info');
        } else {
          addToast('Product not found in inventory', 'error');
        }
      }
    } catch (error) {
      console.error('Error searching for product:', error);
      addToast('Error searching for product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBarcodeInput(scannedCode);
    }
  };

  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProductForm.name || !scannedCode) {
      addToast('Product name and barcode are required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        name: newProductForm.name,
        barcode: scannedCode,
        category: newProductForm.category,
        price: parseFloat(newProductForm.price) || 0,
        count: parseInt(newProductForm.count) || 0,
        expiry: newProductForm.expiry,
        description: newProductForm.description
      };

      await apiService.createProduct(productData);
      addToast('Product added successfully!', 'success');
      
      // Reset form
      setNewProductForm({
        name: '',
        category: 'Fruits',
        price: '',
        count: '',
        expiry: '',
        description: ''
      });
      setShowAddForm(false);
      setScannedCode('');
      
      // Close scanner if in add mode
      if (mode === 'add') {
        onClose();
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to add product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    setIsScanning(true);
    addToast('Camera scanning not implemented yet. Use manual input.', 'info');
    // In a real implementation, you would start the camera here
    // and use a library like QuaggaJS or ZXing for barcode detection
  };

  const stopCamera = () => {
    setIsScanning(false);
  };

  const resetScanner = () => {
    setScannedCode('');
    setFoundProduct(null);
    setShowAddForm(false);
    stopCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Barcode Scanner
            {mode === 'add' && ' - Add Product'}
            {mode === 'sale' && ' - Find for Sale'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Scanner Interface */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-xl p-8 text-center mb-4">
              {isScanning ? (
                <div className="space-y-4">
                  <Camera className="w-16 h-16 mx-auto text-blue-500 animate-pulse" />
                  <p className="text-gray-600">Camera scanning active...</p>
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Stop Camera
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Package className="w-16 h-16 mx-auto text-gray-400" />
                  <p className="text-gray-600">Point camera at barcode or enter manually</p>
                  <button
                    onClick={startCamera}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Camera className="w-5 h-5" />
                    Start Camera
                  </button>
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Or enter barcode manually:
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyPress={handleManualInput}
                  placeholder="Enter or scan barcode..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleBarcodeInput(scannedCode)}
                  disabled={!scannedCode.trim() || isLoading}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {foundProduct && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Product Found!</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {foundProduct.name}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {foundProduct.category}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> ₹{foundProduct.price}
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span> {foundProduct.count}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        foundProduct.status === 'safe' ? 'bg-green-100 text-green-800' :
                        foundProduct.status === 'warning' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {foundProduct.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Barcode:</span> {foundProduct.barcode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add New Product Form */}
          {showAddForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Add New Product</h3>
                  <p className="text-blue-700 text-sm">Barcode: <code className="bg-blue-100 px-2 py-1 rounded">{scannedCode}</code></p>
                </div>
              </div>

              <form onSubmit={handleAddNewProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={newProductForm.category}
                      onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Fruits">Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Meat">Meat</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock Count</label>
                    <input
                      type="number"
                      value={newProductForm.count}
                      onChange={(e) => setNewProductForm({ ...newProductForm, count: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={newProductForm.expiry}
                      onChange={(e) => setNewProductForm({ ...newProductForm, expiry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {isLoading ? 'Adding...' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={resetScanner}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close Scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
