import { useState } from 'react';
import { TrendingUp, DollarSign, Package, Users, AlertTriangle, BarChart3, PieChart, Activity, Calendar, Download } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type MetricType = 'revenue' | 'inventory' | 'suppliers' | 'waste';

export default function AnalyticsSection() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue');
  const { addToast } = useToast();

  const timeRanges = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: '1y', label: 'Last Year' }
  ] as const;

  const metrics = [
    { 
      id: 'revenue', 
      label: 'Revenue Analytics', 
      icon: DollarSign, 
      color: 'bg-green-500/20 text-green-400',
      description: 'Track sales performance and revenue trends'
    },
    { 
      id: 'inventory', 
      label: 'Inventory Analytics', 
      icon: Package, 
      color: 'bg-blue-500/20 text-blue-400',
      description: 'Monitor stock levels and inventory turnover'
    },
    { 
      id: 'suppliers', 
      label: 'Supplier Analytics', 
      icon: Users, 
      color: 'bg-purple-500/20 text-purple-400',
      description: 'Analyze supplier performance and relationships'
    },
    { 
      id: 'waste', 
      label: 'Waste Analytics', 
      icon: AlertTriangle, 
      color: 'bg-red-500/20 text-red-400',
      description: 'Track waste reduction and prevention metrics'
    }
  ] as const;

  const handleExport = () => {
    addToast('Export functionality will be available once data is connected', 'info');
  };

  const EmptyAnalytics = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
        <BarChart3 className="w-12 h-12 text-white/50" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
      <p className="text-white/70 text-center max-w-md mb-6">
        Connect your data sources to generate comprehensive analytics and business insights.
      </p>
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Connect Data Source
        </button>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
          View Sample Analytics
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics & Insights</h1>
          <p className="text-white/70">Track performance metrics and business insights</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4" />
              0%
            </div>
          </div>
          <div>
            <p className="text-white/70 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-white">₹0</p>
            <p className="text-white/50 text-sm">vs ₹0 last month</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4" />
              0%
            </div>
          </div>
          <div>
            <p className="text-white/70 text-sm">Products Sold</p>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-white/50 text-sm">vs 0 last month</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4" />
              0%
            </div>
          </div>
          <div>
            <p className="text-white/70 text-sm">Active Suppliers</p>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-white/50 text-sm">vs 0 last month</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <TrendingUp className="w-4 h-4" />
              0%
            </div>
          </div>
          <div>
            <p className="text-white/70 text-sm">Waste Prevented</p>
            <p className="text-3xl font-bold text-white">₹0</p>
            <p className="text-white/50 text-sm">vs ₹0 last month</p>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {timeRanges.map((range) => (
          <button
            key={range.id}
            onClick={() => setTimeRange(range.id as TimeRange)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === range.id
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Analytics Tabs */}
      <div className="border-b border-white/20">
        <div className="flex flex-wrap gap-1">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id as MetricType)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
                  selectedMetric === metric.id
                    ? 'bg-white/10 text-white border-b-2 border-blue-500'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {metric.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              {metrics.find(m => m.id === selectedMetric)?.label}
            </h3>
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {timeRanges.find(r => r.id === timeRange)?.label}
              </span>
            </div>
          </div>

          <div className="h-80 bg-white/5 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 mb-2">No chart data available</p>
              <p className="text-white/50 text-sm">
                {metrics.find(m => m.id === selectedMetric)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Quick Insights */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Insights</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/70 text-sm">No insights available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white/70 text-sm">Connect data to see trends</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/70 text-sm">Analytics will appear here</span>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">Performance Score</h4>
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">--</span>
              </div>
              <p className="text-white/70 text-sm">Overall performance score</p>
              <p className="text-white/50 text-xs mt-1">Based on key metrics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Category Breakdown</h4>
          <div className="h-48 bg-white/5 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/70">Category distribution chart</p>
              <p className="text-white/50 text-sm">No data to display</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Trend Analysis</h4>
          <div className="h-48 bg-white/5 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/70">Trend analysis chart</p>
              <p className="text-white/50 text-sm">No data to display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
