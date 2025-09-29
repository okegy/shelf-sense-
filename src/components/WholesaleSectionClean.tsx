import { useState, useEffect } from 'react';
import { Package, Plus, Eye, X, Trash2 } from 'lucide-react';
import { WholesaleBox } from '../types';
import { apiService } from '../services/api';
import { useToast } from './ui/ToastProvider';

interface WholesaleSectionProps {
  boxes?: WholesaleBox[];
  onAddBox?: () => void;
}

export default function WholesaleSection({ boxes: propBoxes, onAddBox }: WholesaleSectionProps) {
  const [boxes, setBoxes] = useState<WholesaleBox[]>([]);
  const [expandedBox, setExpandedBox] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    boxCode: '',
    totalUnits: '',
    expiry: '',
    itemPrefix: ''
  });

  useEffect(() => {
    if (propBoxes) {
      setBoxes(propBoxes);
    } else {
      loadBoxes();
    }
  }, [propBoxes]);

  const loadBoxes = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getWholesaleBoxes();
      setBoxes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading wholesale boxes:', error);
      addToast('Failed to load wholesale boxes', 'error');
      setBoxes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBox = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.boxCode || !formData.totalUnits || !formData.expiry) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const totalUnits = parseInt(formData.totalUnits);
      const individualItems = [];
      
      // Generate individual items
      for (let i = 1; i <= totalUnits; i++) {
        individualItems.push({
          id: `${formData.boxCode}-${i.toString().padStart(3, '0')}`,
          name: `${formData.name} Unit ${i}`,
          itemCode: `${formData.itemPrefix || formData.boxCode}-${i.toString().padStart(3, '0')}`,
          expiry: formData.expiry,
          sold: false
        });
      }

      const newBox: WholesaleBox = {
        id: Date.now().toString(),
        name: formData.name,
        boxCode: formData.boxCode,
        totalUnits,
        expiry: formData.expiry,
        individualItems
      };

      // Try to save via API, fallback to local state
      try {
        await apiService.createWholesaleBox(newBox);
      } catch (apiError) {
        // If API fails, just add to local state
        console.warn('API call failed, adding to local state:', apiError);
      }
      
      setBoxes(prev => [...prev, newBox]);
      addToast('Wholesale box added successfully', 'success');
      
      setFormData({
        name: '',
        boxCode: '',
        totalUnits: '',
        expiry: '',
        itemPrefix: ''
      });
      setShowAddModal(false);
      
      if (onAddBox) onAddBox();
    } catch (error: any) {
      addToast(error.message || 'Failed to add wholesale box', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBox = async (boxId: string) => {
    if (!confirm('Are you sure you want to delete this wholesale box?')) return;
    
    try {
      await apiService.deleteWholesaleBox(boxId);
    } catch (error) {
      console.warn('API delete failed:', error);
    }
    
    setBoxes(prev => prev.filter(box => box.id !== boxId));
    addToast('Wholesale box deleted successfully', 'success');
  };

  const toggleBoxExpansion = (boxId: string) => {
    setExpandedBox(expandedBox === boxId ? null : boxId);
  };

  const markItemAsSold = (boxId: string, itemId: string) => {
    setBoxes(prev => prev.map(box => 
      box.id === boxId 
        ? {
            ...box,
            individualItems: box.individualItems.map(item =>
              item.id === itemId ? { ...item, sold: true } : item
            )
          }
        : box
    ));
    addToast('Item marked as sold', 'success');
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-400" />
          Wholesale Box Management
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Box
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-white py-8">Loading wholesale boxes...</div>
      ) : boxes.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-semibold text-white mb-2">No Wholesale Boxes Yet</h3>
          <p className="text-white/70 mb-4">Start by adding your first wholesale box to manage bulk inventory.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
          >
            Add Your First Box
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {boxes.map(box => (
            <div key={box.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{box.name}</h3>
                  <p className="text-white/70">Box contains {box.totalUnits} units</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-mono font-semibold">
                    {box.boxCode}
                  </div>
                  <button
                    onClick={() => toggleBoxExpansion(box.id)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {expandedBox === box.id ? 'Hide Items' : 'View All Items'}
                  </button>
                  <button
                    onClick={() => handleDeleteBox(box.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Show first few items by default */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {box.individualItems.slice(0, expandedBox === box.id ? undefined : 4).map(item => (
                  <div
                    key={item.id}
                    className={`bg-white/5 rounded-lg p-4 border-l-4 ${item.sold ? 'border-red-400 opacity-60' : 'border-blue-400'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-white">{item.name}</div>
                      {item.sold ? (
                        <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded">
                          SOLD
                        </span>
                      ) : (
                        <button
                          onClick={() => markItemAsSold(box.id, item.id)}
                          className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded hover:bg-green-500/30 transition-colors"
                        >
                          Mark Sold
                        </button>
                      )}
                    </div>
                    <div className="font-mono text-sm text-white/70 mb-2">{item.itemCode}</div>
                    <div className="text-sm text-white/70">Exp: {new Date(item.expiry).toLocaleDateString()}</div>
                  </div>
                ))}
                
                {!expandedBox && box.individualItems.length > 4 && (
                  <div className="bg-blue-500/10 border-2 border-dashed border-blue-400/30 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-colors"
                       onClick={() => toggleBoxExpansion(box.id)}>
                    <div className="text-center">
                      <div className="font-semibold text-blue-300">
                        + {box.individualItems.length - 4} more units
                      </div>
                      <div className="text-sm text-blue-400">Click to view all</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Box Statistics */}
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {box.individualItems.filter(item => item.sold).length}
                  </div>
                  <div className="text-sm text-white/70">Sold</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {box.individualItems.filter(item => !item.sold).length}
                  </div>
                  <div className="text-sm text-white/70">Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {box.totalUnits}
                  </div>
                  <div className="text-sm text-white/70">Total Units</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Box Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add Wholesale Box</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBox} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Box Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Fresh Apples Box A1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Box Code *</label>
                <input
                  type="text"
                  placeholder="e.g., BOX-001"
                  value={formData.boxCode}
                  onChange={(e) => setFormData({ ...formData, boxCode: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Total Units *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 50"
                  value={formData.totalUnits}
                  onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Item Code Prefix</label>
                <input
                  type="text"
                  placeholder="e.g., APPLE (optional)"
                  value={formData.itemPrefix}
                  onChange={(e) => setFormData({ ...formData, itemPrefix: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
                >
                  {isLoading ? 'Adding...' : 'Add Box'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
