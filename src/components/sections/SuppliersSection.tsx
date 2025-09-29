import { useEffect, useState } from 'react';
import { Plus, Phone, Mail, MapPin, Star, TrendingUp, X, Edit, Trash2 } from 'lucide-react';
import { Supplier } from '../../types/index';
import { useToast } from '../ui/ToastProvider';

export default function SuppliersSection() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    rating: '5',
    reliability: 'High' as 'High' | 'Medium' | 'Low'
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      setError(null);
      // Since API might not have suppliers endpoint, use local storage or start empty
      const savedSuppliers = localStorage.getItem('suppliers');
      if (savedSuppliers) {
        setSuppliers(JSON.parse(savedSuppliers));
      } else {
        setSuppliers([]);
      }
    } catch (err: any) {
      console.error('Error loading suppliers:', err);
      setSuppliers([]);
      setError(null); // Don't show error for missing endpoint
    } finally {
      setIsLoading(false);
    }
  };

  const saveSuppliers = (newSuppliers: Supplier[]) => {
    localStorage.setItem('suppliers', JSON.stringify(newSuppliers));
    setSuppliers(newSuppliers);
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'High': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Low': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      address: supplier.address,
      rating: supplier.rating.toString(),
      reliability: supplier.reliability
    });
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    const updatedSuppliers = suppliers.filter(s => s.id !== supplierId);
    saveSuppliers(updatedSuppliers);
    addToast('Supplier deleted successfully', 'success');
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact: '',
      email: '',
      address: '',
      rating: '5',
      reliability: 'High'
    });
  };

  const handleSubmitSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contact || !formData.email || !formData.address) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (editingSupplier) {
        // Update existing supplier
        const updatedSuppliers = suppliers.map(s => 
          s.id === editingSupplier.id 
            ? {
                ...s,
                name: formData.name,
                contact: formData.contact,
                email: formData.email,
                address: formData.address,
                rating: parseFloat(formData.rating),
                reliability: formData.reliability
              }
            : s
        );
        saveSuppliers(updatedSuppliers);
        addToast('Supplier updated successfully', 'success');
      } else {
        // Add new supplier
        const newSupplier: Supplier = {
          id: Date.now().toString(),
          name: formData.name,
          contact: formData.contact,
          email: formData.email,
          address: formData.address,
          rating: parseFloat(formData.rating),
          reliability: formData.reliability,
          totalOrders: 0
        };
        
        const updatedSuppliers = [...suppliers, newSupplier];
        saveSuppliers(updatedSuppliers);
        addToast('Supplier added successfully', 'success');
      }
      
      handleCloseModal();
    } catch (error: any) {
      addToast(error.message || 'Failed to save supplier', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Supplier Management</h1>
          <p className="text-white/70">Manage your suppliers and track their performance</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Suppliers</p>
              <p className="text-3xl font-bold text-white">{suppliers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">High Reliability</p>
              <p className="text-3xl font-bold text-green-400">{suppliers.filter(s => s.reliability === 'High').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Avg Rating</p>
              <p className="text-3xl font-bold text-yellow-400">
                {suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-purple-400">{suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="text-center text-white py-8">Loading suppliers...</div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Suppliers Yet</h3>
          <p className="text-white/70 mb-4">Start by adding your first supplier to manage your supply chain.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
          >
            Add Your First Supplier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{supplier.name}</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getReliabilityColor(supplier.reliability)}`}>
                    {supplier.reliability} Reliability
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{supplier.rating}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-white/70">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.contact}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Mail className="w-4 h-4" />
                  <span>{supplier.email}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin className="w-4 h-4" />
                  <span>{supplier.address}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{supplier.totalOrders}</div>
                  <div className="text-xs text-white/70">Orders</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditSupplier(supplier)}
                    className="bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {(showAddModal || editingSupplier) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier Name *</label>
                <input
                  type="text"
                  placeholder="e.g., ABC Foods Ltd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contact Number *</label>
                <input
                  type="tel"
                  placeholder="e.g., +91 9876543210"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g., contact@abcfoods.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <textarea
                  placeholder="e.g., 123 Business Park, City, State - 123456"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Below Average</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Reliability</label>
                  <select
                    value={formData.reliability}
                    onChange={(e) => setFormData({ ...formData, reliability: e.target.value as 'High' | 'Medium' | 'Low' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}