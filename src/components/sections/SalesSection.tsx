import { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, Smartphone, DollarSign, TrendingUp, Calendar, X } from 'lucide-react';
import { Sale } from '../../types/index';
import { sales as mockSales } from '../../data/mockData';
import { products } from '../../data/products';
import { useToast } from '../ui/ToastProvider';
import { apiService } from '../../services/api';

export default function SalesSection() {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState({
    productId: '',
    quantity: 1,
    paymentMethod: 'cash' as 'cash' | 'card' | 'upi'
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalDiscount = sales.reduce((sum, sale) => sum + sale.discount, 0);
  const totalTransactions = sales.length;

  const paymentMethodStats = {
    cash: sales.filter(s => s.paymentMethod === 'cash').length,
    card: sales.filter(s => s.paymentMethod === 'card').length,
    upi: sales.filter(s => s.paymentMethod === 'upi').length
  };

  // Voice command listeners
  useEffect(() => {
    const handleTriggerNewSale = () => {
      setShowNewSaleModal(true);
    };

    window.addEventListener('trigger-new-sale', handleTriggerNewSale);

    return () => {
      window.removeEventListener('trigger-new-sale', handleTriggerNewSale);
    };
  }, []);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.productId) {
      addToast('Please select a product', 'error');
      return;
    }

    setSaving(true);
    try {
      const product = products.find(p => p.id === saleForm.productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const saleData = {
        productId: saleForm.productId,
        quantity: saleForm.quantity,
        unitPrice: product.discountedPrice || product.price,
        totalPrice: (product.discountedPrice || product.price) * saleForm.quantity,
        discount: product.discountedPrice ? (product.price - product.discountedPrice) * saleForm.quantity : 0,
        paymentMethod: saleForm.paymentMethod,
        timestamp: new Date().toISOString()
      };

      await apiService.createSale(saleData);
      
      // Add to local state for immediate UI update
      const newSale: Sale = {
        id: `sale-${Date.now()}`,
        ...saleData
      };
      setSales(prev => [newSale, ...prev]);
      
      addToast(`Sale completed! ₹${saleData.totalPrice} received via ${saleForm.paymentMethod}`, 'success');
      setShowNewSaleModal(false);
      setSaleForm({ productId: '', quantity: 1, paymentMethod: 'cash' });
    } catch (error: any) {
      addToast(error.message || 'Failed to create sale', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sales & Point of Sale</h1>
          <p className="text-white/70">Track sales performance and manage transactions</p>
        </div>
        <button 
          onClick={() => setShowNewSaleModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <ShoppingCart className="w-5 h-5" />
          New Sale
        </button>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Sales</p>
              <p className="text-3xl font-bold text-green-400">₹{totalSales.toLocaleString()}</p>
              <p className="text-green-300 text-sm">+12.5% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Transactions</p>
              <p className="text-3xl font-bold text-blue-400">{totalTransactions}</p>
              <p className="text-blue-300 text-sm">+8 from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Discounts Given</p>
              <p className="text-3xl font-bold text-orange-400">₹{totalDiscount.toLocaleString()}</p>
              <p className="text-orange-300 text-sm">Wastage prevention</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Avg. Transaction</p>
              <p className="text-3xl font-bold text-purple-400">₹{Math.round(totalSales / totalTransactions)}</p>
              <p className="text-purple-300 text-sm">Per transaction</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-400" />
                <span className="text-white">UPI Payments</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{paymentMethodStats.upi}</div>
                <div className="text-white/70 text-sm">transactions</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span className="text-white">Card Payments</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{paymentMethodStats.card}</div>
                <div className="text-white/70 text-sm">transactions</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Cash Payments</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{paymentMethodStats.cash}</div>
                <div className="text-white/70 text-sm">transactions</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowNewSaleModal(true)}
              className="bg-green-500/20 text-green-300 p-4 rounded-xl hover:bg-green-500/30 transition-colors text-center"
            >
              <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">New Sale</div>
            </button>
            
            <button 
              onClick={() => addToast('Refund functionality coming soon!', 'info')}
              className="bg-blue-500/20 text-blue-300 p-4 rounded-xl hover:bg-blue-500/30 transition-colors text-center"
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Refund</div>
            </button>
            
            <button 
              onClick={() => addToast('Reports functionality coming soon!', 'info')}
              className="bg-purple-500/20 text-purple-300 p-4 rounded-xl hover:bg-purple-500/30 transition-colors text-center"
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Reports</div>
            </button>
            
            <button 
              onClick={() => addToast('Sales history functionality coming soon!', 'info')}
              className="bg-orange-500/20 text-orange-300 p-4 rounded-xl hover:bg-orange-500/30 transition-colors text-center"
            >
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">History</div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white/70 py-3">Product</th>
                <th className="text-left text-white/70 py-3">Quantity</th>
                <th className="text-left text-white/70 py-3">Price</th>
                <th className="text-left text-white/70 py-3">Discount</th>
                <th className="text-left text-white/70 py-3">Payment</th>
                <th className="text-left text-white/70 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => {
                const product = products.find(p => p.id === sale.productId);
                return (
                  <tr key={sale.id} className="border-b border-white/10">
                    <td className="text-white py-3">{product?.name || 'Unknown Product'}</td>
                    <td className="text-white py-3">{sale.quantity}</td>
                    <td className="text-white py-3">₹{sale.totalPrice}</td>
                    <td className="text-orange-400 py-3">₹{sale.discount}</td>
                    <td className="text-white py-3 capitalize">{sale.paymentMethod}</td>
                    <td className="text-white/70 py-3">{new Date(sale.timestamp).toLocaleTimeString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      {showNewSaleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">New Sale</h3>
              <button 
                onClick={() => setShowNewSaleModal(false)} 
                className="p-2 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSale} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <select
                  value={saleForm.productId}
                  onChange={(e) => setSaleForm({...saleForm, productId: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.discountedPrice || product.price}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={saleForm.quantity}
                  onChange={(e) => setSaleForm({...saleForm, quantity: Number(e.target.value)})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={saleForm.paymentMethod}
                  onChange={(e) => setSaleForm({...saleForm, paymentMethod: e.target.value as 'cash' | 'card' | 'upi'})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              
              {saleForm.productId && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Total Amount:</div>
                  <div className="text-xl font-bold text-green-600">
                    ₹{((products.find(p => p.id === saleForm.productId)?.discountedPrice || 
                        products.find(p => p.id === saleForm.productId)?.price || 0) * saleForm.quantity).toFixed(2)}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewSaleModal(false)} 
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving || !saleForm.productId} 
                  className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
                >
                  {saving ? 'Processing...' : 'Complete Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}