import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Activity, Wifi, WifiOff, AlertTriangle, Plus, Settings } from 'lucide-react';
import { IoTSensor } from '../../types';
import { apiService } from '../../services/api';
import { useToast } from '../ui/ToastProvider';

export default function IoTSection() {
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    type: 'temperature' as 'temperature' | 'humidity' | 'ethylene' | 'motion',
    location: '',
    minThreshold: '',
    maxThreshold: '',
    unit: '°C'
  });

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getSensors();
      setSensors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading sensors:', error);
      addToast('Failed to load sensors', 'error');
      setSensors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location || !formData.minThreshold || !formData.maxThreshold) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const sensorData = {
        type: formData.type,
        location: formData.location,
        value: 0,
        unit: formData.unit,
        status: 'offline' as const,
        threshold: {
          min: parseFloat(formData.minThreshold),
          max: parseFloat(formData.maxThreshold)
        }
      };

      await apiService.createSensor(sensorData);
      addToast('Sensor added successfully', 'success');
      
      setFormData({
        type: 'temperature',
        location: '',
        minThreshold: '',
        maxThreshold: '',
        unit: '°C'
      });
      setShowAddModal(false);
      loadSensors();
    } catch (error: any) {
      addToast(error.message || 'Failed to add sensor', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSensor = async (sensorId: string) => {
    if (!confirm('Are you sure you want to delete this sensor?')) return;
    
    setIsLoading(true);
    try {
      await apiService.deleteSensor(sensorId);
      addToast('Sensor deleted successfully', 'success');
      loadSensors();
    } catch (error: any) {
      addToast(error.message || 'Failed to delete sensor', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'ethylene': return Activity;
      case 'motion': return Activity;
      default: return Activity;
    }
  };

  const getSensorColor = (sensor: IoTSensor) => {
    if (sensor.status === 'offline') return 'text-gray-400 bg-gray-500/20';
    if (sensor.status === 'error') return 'text-red-400 bg-red-500/20';
    
    const { value, threshold } = sensor;
    if (value < threshold.min || value > threshold.max) {
      return 'text-red-400 bg-red-500/20';
    }
    return 'text-green-400 bg-green-500/20';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="w-4 h-4 text-green-400" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-gray-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getUnitForType = (type: string) => {
    switch (type) {
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'ethylene': return 'ppm';
      case 'motion': return 'count';
      default: return '';
    }
  };

  const onlineSensors = sensors.filter(s => s.status === 'online').length;
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;
  const errorSensors = sensors.filter(s => s.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">IoT Sensor Monitoring</h1>
          <p className="text-white/70">Manage and monitor your environmental sensors</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Sensor
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Sensors</p>
              <p className="text-3xl font-bold text-white">{sensors.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Online</p>
              <p className="text-3xl font-bold text-green-400">{onlineSensors}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Wifi className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Offline</p>
              <p className="text-3xl font-bold text-gray-400">{offlineSensors}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Alerts</p>
              <p className="text-3xl font-bold text-red-400">{errorSensors}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Sensors Grid */}
      {isLoading ? (
        <div className="text-center text-white py-8">Loading sensors...</div>
      ) : sensors.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
          <Activity className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-semibold text-white mb-2">No Sensors Found</h3>
          <p className="text-white/70 mb-4">Start by adding your first IoT sensor to monitor environmental conditions.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
          >
            Add Your First Sensor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sensors.map(sensor => {
            const Icon = getSensorIcon(sensor.type);
            const colorClass = getSensorColor(sensor);
            
            return (
              <div key={sensor.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(sensor.status)}
                    <span className="text-white/70 text-sm capitalize">{sensor.status}</span>
                    <button
                      onClick={() => handleDeleteSensor(sensor.id)}
                      className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete sensor"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1">{sensor.location}</h3>
                  <p className="text-white/70 text-sm capitalize">{sensor.type} Sensor</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{sensor.value.toFixed(1)}</span>
                    <span className="text-white/70">{sensor.unit}</span>
                  </div>
                  <div className="text-sm text-white/70 mt-1">
                    Range: {sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">Last Update:</span>
                    <span className="text-white">
                      {sensor.lastUpdate ? new Date(sensor.lastUpdate).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Threshold Warning */}
                {(sensor.value < sensor.threshold.min || sensor.value > sensor.threshold.max) && sensor.status === 'online' && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 text-sm font-medium">
                        Value outside safe range!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Sensor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add New Sensor</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded hover:bg-gray-100">
                ×
              </button>
            </div>
            <form onSubmit={handleAddSensor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sensor Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const type = e.target.value as typeof formData.type;
                    setFormData({ 
                      ...formData, 
                      type,
                      unit: getUnitForType(type)
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="temperature">Temperature</option>
                  <option value="humidity">Humidity</option>
                  <option value="ethylene">Ethylene</option>
                  <option value="motion">Motion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Dairy Section, Fresh Produce"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.maxThreshold}
                    onChange={(e) => setFormData({ ...formData, maxThreshold: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
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
                  {isLoading ? 'Adding...' : 'Add Sensor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
