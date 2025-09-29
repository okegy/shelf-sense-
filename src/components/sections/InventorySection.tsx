import { useEffect, useMemo, useState } from 'react';
import { Plus, Filter, Download, Upload, Edit, Trash2, Eye, X, Package } from 'lucide-react';
import { Product, User } from '../../types/index';
import ProductCard from '../ProductCard';
import { apiService } from '../../services/api';
import { useToast } from '../ui/ToastProvider';
import EmptyState from '../ui/EmptyState';

export default function InventorySection({ user, categoryFilter }: { user: User; categoryFilter?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const canCreate = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form state
  const [form, setForm] = useState({
    name: '',
    barcode: '',
    count: 0,
    expiry: '',
    price: 0,
    category: 'Fruits'
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    barcode: '',
    count: 0,
    expiry: '',
    price: 0,
    category: 'Fruits'
  });

  const serverFilters = useMemo(() => {
    const filters: Record<string, any> = {
      sortBy,
      sortOrder: 'asc',
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };
    if (searchTerm.trim()) filters.query = searchTerm.trim();
    if (categoryFilter) filters.category = categoryFilter;
    // Map local filter to server fields
    if (filter === 'safe' || filter === 'warning' || filter === 'danger') {
      filters.status = filter;
    } else if (filter === 'low-stock') {
      filters.maxStock = 19;
    } else if (filter === 'expiring') {
      filters.expiringWithin = 2;
    }
    return filters;
  }, [sortBy, pageSize, page, searchTerm, categoryFilter, filter]);

  const loadProducts = async () => {
    try {
      // Try server-side advanced search first
      const data = await apiService.advancedSearchProducts(serverFilters).catch(() => null as any);
      if (data && Array.isArray((data as any).items)) {
        // If backend returns a structured result { items, total }, normalize for our view
        setProducts((data as any).items);
        return;
      }
      if (Array.isArray(data)) {
        setProducts(data);
        return;
      }
      // Fallback to simple list if advanced search unavailable
      const fallback = await apiService.getProducts();
      setProducts(Array.isArray(fallback) ? fallback : []);
    } catch (e: any) {
      console.error('Error loading products:', e);
      setProducts([]);
      addToast('Failed to load products', 'error');
    }
  };

  useEffect(() => {
    loadProducts();

    // Set up voice command listeners for inventory
    const handleVoiceSort = (event: any) => {
      const { sortBy } = event.detail;
      setSortBy(sortBy);
      addToast(`Sorting by ${sortBy}`, 'info');
    };

    const handleVoiceFilter = (event: any) => {
      const { filter } = event.detail;
      setFilter(filter);
      addToast(`Filtering: ${filter}`, 'info');
    };

    const handleTriggerAddProduct = () => {
      setShowAddModal(true);
    };

    window.addEventListener('voice-sort', handleVoiceSort);
    window.addEventListener('voice-filter', handleVoiceFilter);
    window.addEventListener('trigger-add-product', handleTriggerAddProduct);

    return () => {
      window.removeEventListener('voice-sort', handleVoiceSort);
      window.removeEventListener('voice-filter', handleVoiceFilter);
      window.removeEventListener('trigger-add-product', handleTriggerAddProduct);
    };
  }, [categoryFilter, addToast]);

  const openEditModal = (p: Product) => {
    if (!canCreate) return;
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      barcode: p.barcode,
      count: p.count,
      expiry: p.expiry?.slice(0, 10) || '',
      price: p.price,
      category: p.category || 'Fruits'
    } as any);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!canCreate) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: editForm.name,
        barcode: editForm.barcode,
        count: Number(editForm.count),
        expiry: editForm.expiry,
        price: Number(editForm.price),
        category: editForm.category
      } as any;
      await apiService.updateProduct(editingId, payload);
      await loadProducts();
      setShowEditModal(false);
      setEditingId(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!canDelete) return;
    const ok = window.confirm('Delete this product? This action cannot be undone.');
    if (!ok) return;
    setSaving(true);
    setError(null);
    try {
      await apiService.deleteProduct(id);
      await loadProducts();
      addToast('Product deleted', 'success');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete product');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustStock = async (p: Product, delta: number) => {
    const next = Math.max(0, (p.count || 0) + delta);
    setSaving(true);
    setError(null);
    try {
      await apiService.updateProductStock(p.id, next);
      await loadProducts();
      addToast(`Stock updated to ${next} for ${p.name}`, 'success');
    } catch (err: any) {
      setError(err?.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  // Quick add sample product (smoke test)
  const handleQuickAddSample = async () => {
    if (!canCreate) return;
    setSaving(true);
    setError(null);
    try {
      const now = Date.now();
      const sample = {
        name: `Sample Product ${now % 10000}`,
        barcode: `SAMPLE-${now}`,
        count: 10,
        // expiry in 14 days
        expiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        price: 99.99,
        category: 'Fruits',
      } as any;
      await apiService.createProduct(sample);
      await loadProducts();
      addToast('Sample product added', 'success');
    } catch (err: any) {
      setError(err?.message || 'Failed to add sample product');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Basic validation
      if (!form.name || !form.barcode || !form.expiry || !form.category) {
        throw new Error('Please fill all required fields');
      }
      if (form.count < 0 || form.price < 0) {
        throw new Error('Count and price must be non-negative');
      }

      const payload = {
        name: form.name,
        barcode: form.barcode,
        count: Number(form.count),
        expiry: form.expiry,
        price: Number(form.price),
        category: form.category
      } as any;

      await apiService.createProduct(payload);
      await loadProducts();
      addToast('Product added', 'success');
      setShowAddModal(false);
      setForm({ name: '', barcode: '', count: 0, expiry: '', price: 0, category: 'Fruits' });
    } catch (err: any) {
      setError(err?.message || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    if (filter === 'expiring') return product.status === 'warning' || product.status === 'danger';
    if (filter === 'low-stock') return product.count < 20;
    return product.status === filter;
  });

  // Apply category filter from Dashboard if provided
  const categoryFilteredProducts = (categoryFilter
    ? filteredProducts.filter(p => p.category === categoryFilter)
    : filteredProducts);

  // Apply simple search on name or barcode
  const searchedProducts = categoryFilteredProducts.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (p.name?.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q));
  });

  const sortedProducts = [...searchedProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'expiry':
        return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
      case 'stock':
        return b.count - a.count;
      case 'price':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-white/70">Manage your products, track stock levels, and monitor expiry dates</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!canCreate}
            title={!canCreate ? 'Only admin or manager can add products' : ''}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
          <button
            onClick={handleQuickAddSample}
            disabled={!canCreate || saving}
            className="bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50"
            title={!canCreate ? 'Only admin or manager can add products' : 'Quick add a sample product'}
          >
            {saving ? 'Adding…' : 'Quick Add Sample'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-white">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-400">{products.filter(p => p.count < 20).length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Filter className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Expiring Soon</p>
              <p className="text-3xl font-bold text-red-400">{products.filter(p => p.status === 'warning' || p.status === 'danger').length}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Value</p>
              <p className="text-3xl font-bold text-green-400">₹{products.reduce((sum, p) => sum + (p.price * p.count), 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border-2 border-black rounded-xl px-4 py-2 text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all" className="bg-white text-black">All Products</option>
              <option value="safe" className="bg-white text-black">Fresh & Safe</option>
              <option value="warning" className="bg-white text-black">Near Expiry</option>
              <option value="danger" className="bg-white text-black">Expiring Soon</option>
              <option value="expiring" className="bg-white text-black">All Expiring</option>
              <option value="low-stock" className="bg-white text-black">Low Stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border-2 border-black rounded-xl px-4 py-2 text-black font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name" className="bg-white text-black">Sort by Name</option>
              <option value="expiry" className="bg-white text-black">Sort by Expiry</option>
              <option value="stock" className="bg-white text-black">Sort by Stock</option>
              <option value="price" className="bg-white text-black">Sort by Price</option>
            </select>
            <input
              type="text"
              placeholder="Search by name or barcode"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="bg-white border-2 border-black rounded-xl px-4 py-2 text-black font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ minWidth: '240px' }}
            />
          </div>

          <div className="flex gap-2">
            <button className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="bg-green-500/20 text-green-300 px-4 py-2 rounded-xl hover:bg-green-500/30 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Found"
          description="Start building your inventory by adding your first product. You can add products manually or import from a CSV file."
          primaryAction={{
            label: "Add Product",
            onClick: () => setShowAddModal(true)
          }}
          secondaryAction={{
            label: "Import Products",
            onClick: () => addToast('Import functionality will be available soon', 'info')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts
            .slice((page - 1) * pageSize, page * pageSize)
            .map(product => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={() => openEditModal(product)}
                  disabled={!canCreate}
                  title={!canCreate ? 'Only admin or manager can edit products' : 'Edit product'}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAdjustStock(product, -1)}
                  disabled={saving}
                  title="Decrease stock"
                  className="bg-yellow-500 text-white px-2 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  -
                </button>
                <button
                  onClick={() => handleAdjustStock(product, 1)}
                  disabled={saving}
                  title="Increase stock"
                  className="bg-green-600 text-white px-2 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  +
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={!canDelete || saving}
                  title={!canDelete ? 'Only admin can delete products' : 'Delete product'}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    {/* Pagination */}
    {sortedProducts.length > 0 && (
      <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-xl px-4 py-3">
        <div className="text-white/80 text-sm">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedProducts.length)} of {sortedProducts.length}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-white/80 text-sm">Page {page}</span>
          <button
            onClick={() => setPage(p => (p * pageSize < sortedProducts.length ? p + 1 : p))}
            disabled={page * pageSize >= sortedProducts.length}
            className="px-3 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50"
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-white border-2 border-black rounded-xl px-3 py-2 text-black font-semibold"
          >
            <option value={6} className="bg-white text-black">6 per page</option>
            <option value={9} className="bg-white text-black">9 per page</option>
            <option value={12} className="bg-white text-black">12 per page</option>
          </select>
        </div>
      </div>
    )}

    {/* Add Product Modal */}
    {showAddModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Add Product</h3>
            <button onClick={() => setShowAddModal(false)} className="p-2 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Barcode</label>
                <input value={form.barcode} onChange={e=>setForm({...form,barcode:e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Count</label>
                <input type="number" min={0} value={form.count} onChange={e=>setForm({...form,count:Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry</label>
                <input type="date" value={form.expiry} onChange={e=>setForm({...form,expiry:e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input type="number" min={0} step="0.01" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border-2 border-black rounded-lg px-3 py-2 bg-white text-black font-semibold">
                  <option className="bg-white text-black">Fruits</option>
                  <option className="bg-white text-black">Vegetables</option>
                  <option className="bg-white text-black">Dairy</option>
                  <option className="bg-white text-black">Beverages</option>
                  <option className="bg-white text-black">Snacks</option>
                  <option className="bg-white text-black">Bakery</option>
                  <option className="bg-white text-black">Meat</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button type="submit" disabled={saving || !canCreate} className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit Product Modal */}
    {showEditModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Edit Product</h3>
            <button onClick={() => setShowEditModal(false)} className="p-2 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Barcode</label>
                <input value={editForm.barcode} onChange={e=>setEditForm({...editForm,barcode:e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Count</label>
                <input type="number" min={0} value={editForm.count} onChange={e=>setEditForm({...editForm,count:Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry</label>
                <input type="date" value={editForm.expiry} onChange={e=>setEditForm({...editForm,expiry:e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input type="number" min={0} step="0.01" value={editForm.price} onChange={e=>setEditForm({...editForm,price:Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={editForm.category} onChange={e=>setEditForm({...editForm,category:e.target.value})} className="w-full border-2 border-black rounded-lg px-3 py-2 bg-white text-black font-semibold">
                  <option className="bg-white text-black">Fruits</option>
                  <option className="bg-white text-black">Vegetables</option>
                  <option className="bg-white text-black">Dairy</option>
                  <option className="bg-white text-black">Beverages</option>
                  <option className="bg-white text-black">Snacks</option>
                  <option className="bg-white text-black">Bakery</option>
                  <option className="bg-white text-black">Meat</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setShowEditModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button type="submit" disabled={saving || !canCreate} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
  );
}