import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Product } from '../types/index';
import { apiService } from '../services/api';
import { useToast } from './ui/ToastProvider';

interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  timestamp: string;
}

export default function SalesManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [todayStats, setTodayStats] = useState({ total: 0, count: 0 });
  const { addToast } = useToast();

  useEffect(() => {
    loadProducts();
    loadSales();
    loadTodayStats();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
      addToast('Failed to load products', 'error');
    }
  };

  const loadSales = async () => {
    try {
      const data = await apiService.getSales();
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading sales:', error);
      addToast('Failed to load sales', 'error');
    }
  };

  const loadTodayStats = async () => {
    try {
      const data = await apiService.getTodaySales();
      setTodayStats(data && typeof data === 'object' && 'total' in data && 'count' in data ? data as { total: number; count: number } : { total: 0, count: 0 });
    } catch (error) {
      console.error('Error loading today stats:', error);
    }
  };

  const handleSale = async () => {
    if (!selectedProduct) {
      addToast('Please select a product', 'error');
      return;
    }

    if (quantity <= 0) {
      addToast('Quantity must be greater than 0', 'error');
      return;
    }

    if (selectedProduct.count < quantity) {
      addToast('Insufficient stock available', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const saleData = {
        productId: selectedProduct.id,
        quantity,
        unitPrice: selectedProduct.discountedPrice || selectedProduct.price,
        paymentMethod
      };

      await apiService.createSale(saleData);
      addToast(`Sale recorded: ${quantity}x ${selectedProduct.name}`, 'success');
      
      // Reset form
      setSelectedProduct(null);
      setQuantity(1);
      setSearchTerm('');
      
      // Reload data
      loadProducts();
      loadSales();
      loadTodayStats();
    } catch (error: any) {
      addToast(error.message || 'Failed to record sale', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentSales = sales.slice(0, 10);

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-green-400" />
          Sales Management
        </h2>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Today's Sales</p>
              <p className="text-2xl font-bold text-white">₹{todayStats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-white">{todayStats.count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Avg. Transaction</p>
              <p className="text-2xl font-bold text-white">
                ₹{todayStats.count > 0 ? Math.round(todayStats.total / todayStats.count) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Record New Sale</h3>
          
          {/* Product Search */}
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2">Search Product</label>
            <div className="relative">
              <Search className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Product Selection */}
          {searchTerm && (
            <div className="mb-4 max-h-40 overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setSearchTerm(product.name);
                  }}
                  className="p-3 bg-white/5 border border-white/10 rounded-lg mb-2 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-white/70 text-sm">Stock: {product.count} | Price: ₹{product.discountedPrice || product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm">{product.barcode}</p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.status === 'safe' ? 'bg-green-500/20 text-green-300' :
                        product.status === 'warning' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Product */}
          {selectedProduct && (
            <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <h4 className="text-white font-semibold mb-2">Selected Product</h4>
              <p className="text-white">{selectedProduct.name}</p>
              <p className="text-white/70 text-sm">
                Available: {selectedProduct.count} | Price: ₹{selectedProduct.discountedPrice || selectedProduct.price}
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              max={selectedProduct?.count || 1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'upi')}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash" className="text-black">Cash</option>
              <option value="card" className="text-black">Card</option>
              <option value="upi" className="text-black">UPI</option>
            </select>
          </div>

          {/* Total */}
          {selectedProduct && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-white/70 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-green-400">
                ₹{((selectedProduct.discountedPrice || selectedProduct.price) * quantity).toFixed(2)}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSale}
            disabled={!selectedProduct || isLoading || quantity <= 0}
            className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isLoading ? 'Recording Sale...' : 'Record Sale'}
          </button>
        </div>

        {/* Recent Sales */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Sales</h3>
          
          {recentSales.length === 0 ? (
            <div className="text-center text-white/70 py-8">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-white/30" />
              <p>No sales recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map(sale => (
                <div key={sale.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-medium">{sale.productName}</p>
                      <p className="text-white/70 text-sm">
                        {sale.quantity}x ₹{sale.unitPrice} = ₹{sale.totalPrice}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sale.paymentMethod === 'cash' ? 'bg-green-500/20 text-green-300' :
                        sale.paymentMethod === 'card' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {sale.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/50 text-xs">
                    {new Date(sale.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
