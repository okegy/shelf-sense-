import { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Database, Globe, Save, RefreshCw, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';
import LoadingSpinner from '../ui/LoadingSpinner';

interface UserSettings {
  profile: {
    username: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    lowStockAlerts: boolean;
    expiryAlerts: boolean;
    salesReports: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordLastChanged: string;
  };
  system: {
    theme: 'dark' | 'light' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  business: {
    storeName: string;
    storeAddress: string;
    taxRate: number;
    lowStockThreshold: number;
    expiryWarningDays: number;
  };
}

type SettingsTab = 'profile' | 'notifications' | 'security' | 'system' | 'business' | 'data';

export default function SettingsSection() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSettings: UserSettings = {
        profile: {
          username: 'admin',
          email: 'admin@shelfsense.com',
          fullName: 'Store Administrator',
          role: 'Administrator'
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          lowStockAlerts: true,
          expiryAlerts: true,
          salesReports: false
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordLastChanged: '2024-01-01'
        },
        system: {
          theme: 'dark',
          language: 'en',
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
          currency: 'INR'
        },
        business: {
          storeName: 'ShelfSense Smart Store',
          storeAddress: '123 Main Street, City, State 12345',
          taxRate: 18,
          lowStockThreshold: 10,
          expiryWarningDays: 3
        }
      };

      setSettings(mockSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      addToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      addToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof UserSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }));
  };

  const exportData = async () => {
    addToast('Exporting data...', 'info');
    // Simulate export
    setTimeout(() => {
      addToast('Data exported successfully!', 'success');
    }, 2000);
  };

  const importData = async () => {
    addToast('Data import feature coming soon!', 'info');
  };

  const resetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      addToast('Settings reset to defaults', 'success');
      loadSettings();
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={settings?.profile.username || ''}
            onChange={(e) => updateSettings('profile', 'username', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={settings?.profile.email || ''}
            onChange={(e) => updateSettings('profile', 'email', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={settings?.profile.fullName || ''}
            onChange={(e) => updateSettings('profile', 'fullName', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Role</label>
          <input
            type="text"
            value={settings?.profile.role || ''}
            disabled
            className="w-full px-4 py-2 bg-slate-800/30 border border-slate-700/50 rounded-lg text-white/60 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">Change Password</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 pr-10 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="text-red-400 text-sm mt-2">Passwords do not match</p>
        )}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
          { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications' },
          { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Get notified when products are running low' },
          { key: 'expiryAlerts', label: 'Expiry Alerts', desc: 'Get notified about expiring products' },
          { key: 'salesReports', label: 'Daily Sales Reports', desc: 'Receive daily sales summary emails' }
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
            <div>
              <h3 className="text-white font-medium">{label}</h3>
              <p className="text-white/60 text-sm">{desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.notifications[key as keyof typeof settings.notifications] || false}
                onChange={(e) => updateSettings('notifications', key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div>
            <h3 className="text-white font-medium">Two-Factor Authentication</h3>
            <p className="text-white/60 text-sm">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.security.twoFactorAuth || false}
              onChange={(e) => updateSettings('security', 'twoFactorAuth', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg">
          <label className="block text-white/80 text-sm font-medium mb-2">Session Timeout (minutes)</label>
          <select
            value={settings?.security.sessionTimeout || 30}
            onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={480}>8 hours</option>
          </select>
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white font-medium">Password</h3>
              <p className="text-white/60 text-sm">
                Last changed: {new Date(settings?.security.passwordLastChanged || '').toLocaleDateString()}
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Theme</label>
          <select
            value={settings?.system.theme || 'dark'}
            onChange={(e) => updateSettings('system', 'theme', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Language</label>
          <select
            value={settings?.system.language || 'en'}
            onChange={(e) => updateSettings('system', 'language', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Timezone</label>
          <select
            value={settings?.system.timezone || 'Asia/Kolkata'}
            onChange={(e) => updateSettings('system', 'timezone', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Date Format</label>
          <select
            value={settings?.system.dateFormat || 'DD/MM/YYYY'}
            onChange={(e) => updateSettings('system', 'dateFormat', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Currency</label>
          <select
            value={settings?.system.currency || 'INR'}
            onChange={(e) => updateSettings('system', 'currency', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderBusinessTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-white/80 text-sm font-medium mb-2">Store Name</label>
          <input
            type="text"
            value={settings?.business.storeName || ''}
            onChange={(e) => updateSettings('business', 'storeName', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-white/80 text-sm font-medium mb-2">Store Address</label>
          <textarea
            value={settings?.business.storeAddress || ''}
            onChange={(e) => updateSettings('business', 'storeAddress', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={settings?.business.taxRate || 0}
            onChange={(e) => updateSettings('business', 'taxRate', parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Low Stock Threshold</label>
          <input
            type="number"
            min="1"
            value={settings?.business.lowStockThreshold || 10}
            onChange={(e) => updateSettings('business', 'lowStockThreshold', parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Expiry Warning (days)</label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings?.business.expiryWarningDays || 3}
            onChange={(e) => updateSettings('business', 'expiryWarningDays', parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 rounded-lg p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Export all your store data including products, sales, and settings.
          </p>
          <button
            onClick={exportData}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Export All Data
          </button>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Import data from a previous backup or another system.
          </p>
          <button
            onClick={importData}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Import Data
          </button>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Backup
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Create a backup of your entire database.
          </p>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
            Create Backup
          </button>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Reset Settings
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Reset all settings to their default values.
          </p>
          <button
            onClick={resetToDefaults}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'security': return renderSecurityTab();
      case 'system': return renderSystemTab();
      case 'business': return renderBusinessTab();
      case 'data': return renderDataTab();
      default: return renderProfileTab();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/70">Manage your account and system preferences</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Settings Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'notifications', label: 'Notifications', icon: Bell },
          { key: 'security', label: 'Security', icon: Shield },
          { key: 'system', label: 'System', icon: Settings },
          { key: 'business', label: 'Business', icon: Globe },
          { key: 'data', label: 'Data', icon: Database }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as SettingsTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/50 text-white/70 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="bg-slate-800/20 border border-slate-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
        </h2>
        {renderActiveTab()}
      </div>
    </div>
  );
}
