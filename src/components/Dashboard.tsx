import { useState, useEffect } from 'react';
import { User, Product, FinancialData } from '../types/index';
import Header from './Header';
import Sidebar from './Sidebar';
import FinancialCard from './FinancialCard';
import SearchSection from './SearchSection';
import BarcodeModal from './BarcodeModal';
import InventorySection from './sections/InventorySection';
import SuppliersSection from './sections/SuppliersSection';
import IoTSection from './sections/IoTSection';
import AlertsSection from './sections/AlertsSection';
import AnalyticsSection from './sections/AnalyticsSection';
import PurchaseOrdersSection from './sections/PurchaseOrdersSection';
import ReportsSection from './sections/ReportsSection';
import SettingsSection from './sections/SettingsSection';
import CorrosionDetectionSection from './sections/CorrosionDetectionSection';
import ProductManagement from './ProductManagement';
import SalesManagement from './SalesManagement';
import { apiService } from '../services/api';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData>({
    todayProfit: 0,
    wastagePrevented: 0,
    itemsAtRisk: 0,
    profitChange: '0% from yesterday'
  });
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);

  useEffect(() => {
    loadDashboardData();

    // Set up voice command listeners
    const handleVoiceNavigate = (event: CustomEvent) => {
      const { section } = event.detail;
      handleSectionChange(section);
    };

    const handleVoiceNewSale = () => {
      handleSectionChange('sales');
      // Trigger new sale modal after navigation
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-new-sale'));
      }, 500);
    };

    const handleVoiceAddProduct = () => {
      handleSectionChange('products');
      // Trigger add product modal after navigation
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-add-product'));
      }, 500);
    };

    const handleVoiceAddSupplier = () => {
      handleSectionChange('suppliers');
      // Trigger add supplier modal after navigation
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-add-supplier'));
      }, 500);
    };

    const handleVoiceBarcodeScan = () => {
      setIsBarcodeModalOpen(true);
    };

    const handleVoiceRefresh = () => {
      loadDashboardData();
    };

    const handleVoiceCorrosionScan = () => {
      handleSectionChange('corrosion');
      // Trigger hardware initialization after navigation
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-hardware-init'));
      }, 500);
    };

    const handleVoiceBatchScan = () => {
      handleSectionChange('corrosion');
      // Trigger batch scan after navigation
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-batch-scan'));
      }, 500);
    };

    // Add event listeners
    window.addEventListener('voice-navigate', handleVoiceNavigate as EventListener);
    window.addEventListener('voice-new-sale', handleVoiceNewSale);
    window.addEventListener('voice-add-product', handleVoiceAddProduct);
    window.addEventListener('voice-add-supplier', handleVoiceAddSupplier);
    window.addEventListener('voice-barcode-scan', handleVoiceBarcodeScan);
    window.addEventListener('voice-refresh', handleVoiceRefresh);
    window.addEventListener('voice-corrosion-scan', handleVoiceCorrosionScan);
    window.addEventListener('voice-batch-scan', handleVoiceBatchScan);
    window.addEventListener('voice-hardware-init', handleVoiceCorrosionScan);

    return () => {
      window.removeEventListener('voice-navigate', handleVoiceNavigate as EventListener);
      window.removeEventListener('voice-new-sale', handleVoiceNewSale);
      window.removeEventListener('voice-add-product', handleVoiceAddProduct);
      window.removeEventListener('voice-add-supplier', handleVoiceAddSupplier);
      window.removeEventListener('voice-barcode-scan', handleVoiceBarcodeScan);
      window.removeEventListener('voice-refresh', handleVoiceRefresh);
      window.removeEventListener('voice-corrosion-scan', handleVoiceCorrosionScan);
      window.removeEventListener('voice-batch-scan', handleVoiceBatchScan);
      window.removeEventListener('voice-hardware-init', handleVoiceCorrosionScan);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const productsData = await apiService.getProducts() as Product[];
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Calculate financial data
      const expiringProducts = Array.isArray(productsData) ? productsData.filter((p: Product) => {
        try {
          const expiryDate = new Date(p.expiry);
          const today = new Date();
          const diffTime = expiryDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 2;
        } catch (dateError) {
          console.warn('Invalid date format for product:', p.id, p.expiry);
          return false;
        }
      }).length : 0;

      setFinancialData(prev => ({
        ...prev,
        itemsAtRisk: expiringProducts,
        wastagePrevented: Math.floor(prev.todayProfit * 0.15) // 15% of profit as wastage prevented
      }));
      // Also refresh unread alerts count alongside data load
      try {
        const unread = await apiService.getUnreadAlerts() as any[];
        setUnreadAlerts(Array.isArray(unread) ? unread.length : 0);
      } catch (alertErr) {
        console.warn('Failed to refresh unread alerts:', alertErr);
      }
    } catch (err) {
      console.error('Dashboard data loading error:', err);
      // Set empty state on error to prevent crashes
      setProducts([]);
      setFinancialData(prev => ({
        ...prev,
        itemsAtRisk: 0,
        wastagePrevented: 0
      }));
    }
  };

  // Load financial data periodically
  useEffect(() => {
    const loadData = async () => {
      try {
        const salesData = await apiService.getTodaySales() as { profit?: number };
        const products = await apiService.getProducts() as Product[];
        
        const todayProfit = salesData?.profit || 0;
        const expiringProducts = products.filter((p: Product) => {
          const expiryDate = new Date(p.expiry);
          const today = new Date();
          const diffTime = expiryDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 2;
        }).length;

        setFinancialData(prev => ({
          ...prev,
          todayProfit,
          wastagePrevented: Math.floor(todayProfit * 0.15), // 15% of profit as wastage prevented
          itemsAtRisk: expiringProducts
        }));
      } catch (error) {
        console.error('Error refreshing financial data:', error);
      }
    };

    // Load data immediately and then set up interval
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Poll unread alerts periodically
  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const unread = await apiService.getUnreadAlerts() as any[];
        if (isMounted) setUnreadAlerts(Array.isArray(unread) ? unread.length : 0);
      } catch (e) {
        // non-fatal
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSectionChange = async (section: string) => {
    setActiveSection(section);
    
    // Mark all alerts as read when navigating to alerts section
    if (section === 'alerts' && unreadAlerts > 0) {
      try {
        await apiService.markAllAlertsAsRead();
        setUnreadAlerts(0);
      } catch (error) {
        console.warn('Failed to mark alerts as read:', error);
      }
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const product = await apiService.getProductByBarcode(barcode);
      if (product && product.name) {
        // This would trigger a search with the scanned barcode
        const searchInput = document.querySelector('input[placeholder*="Search products"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.value = product.name;
          searchInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'inventory':
        return <InventorySection user={user} categoryFilter={selectedCategoryId ?? undefined} />;
      case 'products':
        return <ProductManagement onProductAdded={loadDashboardData} />;
      case 'sales':
        return <SalesManagement />;
      case 'suppliers':
        return <SuppliersSection />;
      case 'purchase':
        return <PurchaseOrdersSection />;
      case 'reports':
        return <ReportsSection />;
      case 'settings':
        return <SettingsSection />;
      case 'iot':
        return <IoTSection />;
      case 'alerts':
        return <AlertsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'corrosion':
        return <CorrosionDetectionSection />;
      case 'barcode':
        setIsBarcodeModalOpen(true);
        return renderDashboardHome();
      default:
        return renderDashboardHome();
    }
  };

  const renderDashboardHome = () => (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="search-section">
        <SearchSection
          products={products}
          onScanBarcode={() => setIsBarcodeModalOpen(true)}
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard
          type="profit"
          title="Today's Profit"
          amount={`₹${financialData.todayProfit.toFixed(2)}`}
          subtitle={financialData.profitChange}
        />
        <FinancialCard
          type="savings"
          title="Wastage Prevented"
          amount={`₹${financialData.wastagePrevented.toFixed(2)}`}
          subtitle="Early discount system savings"
        />
        <FinancialCard
          type="risk"
          title="Items at Risk"
          amount={`${financialData.itemsAtRisk} items`}
          subtitle="Expiring in next 2 days"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isCollapsed={sidebarCollapsed}
        />
        <div className="flex-1 flex flex-col">
          <Header
            user={user}
            onLogout={onLogout}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            unreadAlerts={unreadAlerts}
          />
          <div className="p-6">
            <div className={`relative rounded-2xl overflow-hidden ${
              activeSection === 'inventory' ? 'bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20' :
              activeSection === 'sales' ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20' :
              activeSection === 'suppliers' ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20' :
              activeSection === 'iot' ? 'bg-gradient-to-br from-purple-900/20 to-violet-900/20 border border-purple-500/20' :
              activeSection === 'alerts' ? 'bg-gradient-to-br from-red-900/20 to-rose-900/20 border border-red-500/20' :
              'bg-gradient-to-br from-slate-800/50 to-gray-800/50 border border-slate-700/50'
            } backdrop-blur-sm`}>
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onScan={handleBarcodeScan}
      />
    </div>
  );
}
