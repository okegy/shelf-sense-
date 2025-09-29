import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Alert } from '../../types/index';
import { apiService } from '../../services/api';
import { useToast } from '../ui/ToastProvider';

export default function AlertsSection() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      addToast('Failed to load alerts', 'error');
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.isRead;
    return alert.severity === filter;
  });

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expiry': return '⏰';
      case 'stock': return '📦';
      case 'sensor': return '🌡️';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Alerts & Notifications</h1>
          <p className="text-white/70">Monitor system alerts and important notifications</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <CheckCircle className="w-5 h-5" />
          Mark All Read
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Alerts</p>
              <p className="text-3xl font-bold text-white">{alerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Unread</p>
              <p className="text-3xl font-bold text-orange-400">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Critical</p>
              <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">High Priority</p>
              <p className="text-3xl font-bold text-yellow-400">{highCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-white/70" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Alerts</option>
            <option value="unread">Unread Only</option>
            <option value="critical">Critical</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border transition-all duration-200 hover:bg-white/15 ${
              !alert.isRead ? 'border-blue-500/50' : 'border-white/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="text-2xl">{getTypeIcon(alert.type)}</div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </div>
                    {!alert.isRead && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    )}
                  </div>
                  
                  <p className="text-white/70 mb-3">{alert.message}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    <span className="capitalize">{alert.type} Alert</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!alert.isRead && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Mark Read
                  </button>
                )}
                <button className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-white py-8">Loading alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {alerts.length === 0 ? 'No Alerts Yet' : 'No alerts found'}
          </h3>
          <p className="text-white/70">
            {alerts.length === 0 
              ? 'Great! Your system is running smoothly with no alerts to show.' 
              : 'All clear! No alerts match your current filter.'
            }
          </p>
        </div>
      ) : null}
    </div>
  );
}