import { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Package, Calendar, DollarSign, User, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
}

export default function PurchaseOrdersSection() {
  const [purchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addToast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'ordered': return <Package className="w-4 h-4" />;
      case 'received': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'approved': return 'text-blue-400 bg-blue-500/20';
      case 'ordered': return 'text-purple-400 bg-purple-500/20';
      case 'received': return 'text-green-400 bg-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleCreateOrder = () => {
    addToast('Purchase order creation will be available once suppliers are connected', 'info');
    setShowCreateModal(false);
  };

  const handleExport = (format: string) => {
    addToast(`Export functionality will be available once data is connected`, 'info');
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
        <Package className="w-12 h-12 text-white/50" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Purchase Orders</h3>
      <p className="text-white/70 text-center max-w-md mb-6">
        Create your first purchase order to start managing supplier relationships and inventory procurement.
      </p>
      <div className="flex gap-3">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </button>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
          Import Orders
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Purchase Orders</h1>
          <p className="text-white/70">Manage supplier orders and procurement</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Purchase Order
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-400">0</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Completed Orders</p>
              <p className="text-3xl font-bold text-green-400">0</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Value</p>
              <p className="text-3xl font-bold text-white">₹0</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders by number, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Purchase Orders List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 min-h-[400px]">
        {purchaseOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/70 pb-3">Order #</th>
                    <th className="text-left text-white/70 pb-3">Supplier</th>
                    <th className="text-left text-white/70 pb-3">Items</th>
                    <th className="text-left text-white/70 pb-3">Amount</th>
                    <th className="text-left text-white/70 pb-3">Status</th>
                    <th className="text-left text-white/70 pb-3">Date</th>
                    <th className="text-left text-white/70 pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Table rows would go here when data is available */}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl mx-4 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Purchase Order</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center py-8">
                <User className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Suppliers Available</h3>
                <p className="text-white/70 mb-4">
                  Add suppliers first to create purchase orders
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => {
                      setShowCreateModal(false);
                      addToast('Navigate to Suppliers section to add suppliers', 'info');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add Suppliers
                  </button>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
