import {
  Home,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Settings,
  FileText,
  Truck,
  Scan,
  BarChart3,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'products', label: 'Product Management', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: BarChart3 },
  { id: 'sales', label: 'Sales & POS', icon: ShoppingCart },
  { id: 'suppliers', label: 'Suppliers', icon: Users },
  { id: 'purchase', label: 'Purchase Orders', icon: Truck },
  { id: 'corrosion', label: 'Corrosion Detection', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'barcode', label: 'Barcode Scanner', icon: Scan },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ activeSection, onSectionChange, isCollapsed }: SidebarProps) {
  return (
    <div className={`bg-white/10 backdrop-blur-lg border-r border-white/20 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen`}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">ShelfSense</h1>
              <p className="text-xs text-white/70">Smart Inventory</p>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}