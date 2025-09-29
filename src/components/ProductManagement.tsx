import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Search, Filter, Download, Upload } from 'lucide-react';
import { Product } from '../types/index';
import { apiService } from '../services/api';
import { useToast } from './ui/ToastProvider';

interface ProductManagementProps {
  onProductAdded?: () => void;
}

export default function ProductManagement({ onProductAdded }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    count: '',
    expiry: '',
    price: '',
    discountedPrice: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
      addToast('Failed to load products', 'error');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      const categoryNames = Array.isArray(data) ? data.map((cat: any) => cat.name) : [];
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      barcode: '',
      count: '',
      expiry: '',
      price: '',
      discountedPrice: '',
      category: '',
      description: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.barcode) {
      addToast('Name and barcode are required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, formData);
        addToast('Product updated successfully', 'success');
      } else {
        await apiService.createProduct(formData);
        addToast('Product added successfully', 'success');
      }
      
      resetForm();
      loadProducts();
      onProductAdded?.();
    } catch (error: any) {
      addToast(error.message || 'Failed to save product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      barcode: product.barcode,
      count: product.count?.toString() || '',
      expiry: product.expiry || '',
      price: product.price?.toString() || '',
      discountedPrice: product.discountedPrice?.toString() || '',
      category: product.category || '',
      description: product.description || ''
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setIsLoading(true);
    try {
      await apiService.deleteProduct(productId);
      addToast('Product deleted successfully', 'success');
      loadProducts();
      onProductAdded?.();
    } catch (error: any) {
      addToast(error.message || 'Failed to delete product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    const categoryName = prompt('Enter new category name:');
    if (!categoryName) return;

    try {
      await apiService.request('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: categoryName, icon: '📦' })
      });
      loadCategories();
      addToast('Category added successfully', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to add category', 'error');
    }
  };

  const exportData = async () => {
    try {
      const data = await apiService.request('/data/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shelfsense-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Data exported successfully', 'success');
    } catch (error) {
      addToast('Failed to export data', 'error');
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await apiService.request('/data/import', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      loadProducts();
      loadCategories();
      addToast('Data imported successfully', 'success');
    } catch (error) {
      addToast('Failed to import data', 'error');
    }
    event.target.value = '';
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) return;
    
    try {
      await apiService.request('/data/reset', { method: 'POST' });
      loadProducts();
      loadCategories();
      addToast('All data cleared', 'success');
    } catch (error) {
      addToast('Failed to clear data', 'error');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesStatus = !filterStatus || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100';
      case 'danger': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'safe': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-400" />
          Product Management
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <label className="bg-green-500/20 text-green-300 px-4 py-2 rounded-xl hover:bg-green-500/30 transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
          
          <button
            onClick={clearAllData}
            className="bg-red-500/20 text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-colors"
          >
            Clear All
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category} className="text-black">{category}</option>
          ))}
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="safe" className="text-black">Safe</option>
          <option value="warning" className="text-black">Warning</option>
          <option value="danger" className="text-black">Danger</option>
          <option value="expired" className="text-black">Expired</option>
        </select>
        
        <button
          onClick={handleAddCategory}
          className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-500/30 transition-colors flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <input
              type="text"
              placeholder="Barcode *"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <input
              type="number"
              placeholder="Stock Count"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="date"
              placeholder="Expiry Date"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="number"
              step="0.01"
              placeholder="Discounted Price"
              value={formData.discountedPrice}
              onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="text-black">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category} className="text-black">{category}</option>
              ))}
            </select>
            
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              rows={3}
            />
            
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-white py-8">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-white/70 py-8">
            <Package className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p>Start by adding your first product to the inventory.</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(product.status)}`}>
                      {product.status?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/70">
                    <div>
                      <span className="font-medium">Barcode:</span> {product.barcode}
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span> {product.count || 0}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> ₹{product.price || 0}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {product.category || 'Uncategorized'}
                    </div>
                    {product.expiry && (
                      <div>
                        <span className="font-medium">Expiry:</span> {new Date(product.expiry).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-blue-500/20 text-blue-300 p-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500/20 text-red-300 p-2 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
