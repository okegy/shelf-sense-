import { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, FileText, PieChart, Activity, DollarSign, Package, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';

type ReportType = 'sales' | 'inventory' | 'supplier' | 'waste' | 'financial' | 'custom';
type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom';

export default function ReportsSection() {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const { addToast } = useToast();

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    addToast(`Export functionality will be available once data is connected`, 'info');
  };

  const getDateRangeLabel = (range: DateRange) => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      case 'custom': return 'Custom Range';
      default: return 'Last 30 Days';
    }
  };

  const reportTypes = [
    { id: 'sales', label: 'Sales Report', icon: DollarSign, color: 'bg-green-500/20 text-green-400' },
    { id: 'inventory', label: 'Inventory Report', icon: Package, color: 'bg-blue-500/20 text-blue-400' },
    { id: 'supplier', label: 'Supplier Report', icon: Users, color: 'bg-purple-500/20 text-purple-400' },
    { id: 'waste', label: 'Waste Report', icon: AlertTriangle, color: 'bg-red-500/20 text-red-400' },
    { id: 'financial', label: 'Financial Report', icon: TrendingUp, color: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'custom', label: 'Custom Report', icon: FileText, color: 'bg-gray-500/20 text-gray-400' }
  ] as const;

  const dateRanges = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: '1y', label: 'Last Year' },
    { id: 'custom', label: 'Custom Range' }
  ] as const;

  const EmptyState = ({ reportType }: { reportType: string }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
        <BarChart3 className="w-12 h-12 text-white/50" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No {reportType} Data Available</h3>
      <p className="text-white/70 text-center max-w-md mb-6">
        Connect your data sources to generate comprehensive {reportType.toLowerCase()} reports and analytics.
      </p>
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Connect Data Source
        </button>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
          View Sample Report
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-white/70">Comprehensive business insights and analytics</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportReport('pdf')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button 
            onClick={() => exportReport('excel')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button 
            onClick={() => exportReport('csv')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {dateRanges.map((range) => (
          <button
            key={range.id}
            onClick={() => setDateRange(range.id as DateRange)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === range.id
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {dateRange === 'custom' && (
        <div className="flex gap-4 items-center bg-white/10 p-4 rounded-lg">
          <Calendar className="w-5 h-5 text-white/70" />
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm text-white/70 mb-1">From</label>
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">To</label>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Report Type Tabs */}
      <div className="border-b border-white/20">
        <div className="flex flex-wrap gap-1">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id as ReportType)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
                  activeReport === report.id
                    ? 'bg-white/10 text-white border-b-2 border-blue-500'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {report.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 min-h-[500px]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {reportTypes.find(r => r.id === activeReport)?.label}
            </h2>
            <span className="text-white/60 text-sm">
              {getDateRangeLabel(dateRange)}
            </span>
          </div>

          {/* Empty State */}
          <EmptyState reportType={reportTypes.find(r => r.id === activeReport)?.label || 'Report'} />
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Revenue</p>
              <p className="text-xl font-bold text-white">₹0</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Products</p>
              <p className="text-xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Active Suppliers</p>
              <p className="text-xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Waste Prevented</p>
              <p className="text-xl font-bold text-white">₹0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Analytics Overview</h3>
        <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <PieChart className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <p className="text-white/70">Charts and visualizations will appear here</p>
            <p className="text-white/50 text-sm">Connect your data to see detailed analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
