import { IoTSensor } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export class IoTSensorModel {
  private static sensors: IoTSensor[] = [
    {
      id: 'sensor-001',
      type: 'temperature',
      location: 'Dairy Section',
      value: 4.2,
      unit: '°C',
      status: 'online',
      lastUpdate: new Date('2024-01-15T12:00:00Z'),
      threshold: { min: 2, max: 6 },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15T12:00:00Z')
    },
    {
      id: 'sensor-002',
      type: 'humidity',
      location: 'Fresh Produce',
      value: 68,
      unit: '%',
      status: 'online',
      lastUpdate: new Date('2024-01-15T12:00:00Z'),
      threshold: { min: 60, max: 80 },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15T12:00:00Z')
    },
    {
      id: 'sensor-003',
      type: 'ethylene',
      location: 'Fruit Storage',
      value: 2.3,
      unit: 'ppm',
      status: 'online',
      lastUpdate: new Date('2024-01-15T12:00:00Z'),
      threshold: { min: 0, max: 5 },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15T12:00:00Z')
    },
    {
      id: 'sensor-004',
      type: 'temperature',
      location: 'Frozen Section',
      value: -18.5,
      unit: '°C',
      status: 'offline',
      lastUpdate: new Date('2024-01-15T10:30:00Z'),
      threshold: { min: -20, max: -15 },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15T10:30:00Z')
    }
  ];

  static async findAll(): Promise<IoTSensor[]> {
    return this.sensors;
  }

  static async findById(id: string): Promise<IoTSensor | null> {
    return this.sensors.find(sensor => sensor.id === id) || null;
  }

  static async findByType(type: string): Promise<IoTSensor[]> {
    return this.sensors.filter(sensor => sensor.type === type);
  }

  static async findByLocation(location: string): Promise<IoTSensor[]> {
    return this.sensors.filter(sensor =>
      sensor.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  static async updateSensorData(id: string, value: number): Promise<IoTSensor | null> {
    const sensorIndex = this.sensors.findIndex(sensor => sensor.id === id);
    if (sensorIndex === -1) return null;

    const sensor = this.sensors[sensorIndex];
    const newStatus = this.determineStatus(value, sensor.threshold);

    const updatedSensor: IoTSensor = {
      ...sensor,
      value,
      status: newStatus,
      lastUpdate: new Date(),
      updatedAt: new Date()
    };

    this.sensors[sensorIndex] = updatedSensor;
    return updatedSensor;
  }

  static async create(sensorData: Omit<IoTSensor, 'id' | 'createdAt' | 'updatedAt'>): Promise<IoTSensor> {
    const newSensor: IoTSensor = {
      id: generateId(),
      ...sensorData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sensors.push(newSensor);
    return newSensor;
  }

  static async delete(id: string): Promise<boolean> {
    const initialLength = this.sensors.length;
    this.sensors = this.sensors.filter(sensor => sensor.id !== id);
    return this.sensors.length < initialLength;
  }

  static async getSensorsWithAlerts(): Promise<IoTSensor[]> {
    return this.sensors.filter(sensor =>
      sensor.status === 'error' ||
      sensor.value < sensor.threshold.min ||
      sensor.value > sensor.threshold.max
    );
  }

  static async getOnlineSensors(): Promise<IoTSensor[]> {
    return this.sensors.filter(sensor => sensor.status === 'online');
  }

  static async getOfflineSensors(): Promise<IoTSensor[]> {
    return this.sensors.filter(sensor => sensor.status === 'offline');
  }

  private static determineStatus(value: number, threshold: { min: number; max: number }): 'online' | 'offline' | 'error' {
    if (value < threshold.min || value > threshold.max) {
      return 'error';
    }
    return 'online';
  }

  // Simulate sensor data updates
  static async simulateSensorUpdates(): Promise<void> {
    for (const sensor of this.sensors) {
      if (sensor.status === 'online') {
        // Add some random variation to simulate real sensor readings
        const variation = (Math.random() - 0.5) * 2;
        const newValue = Math.max(0, sensor.value + variation);

        await this.updateSensorData(sensor.id, newValue);
      }
    }
  }

  static async getSensorStats() {
    const total = this.sensors.length;
    const online = this.sensors.filter(s => s.status === 'online').length;
    const offline = this.sensors.filter(s => s.status === 'offline').length;
    const error = this.sensors.filter(s => s.status === 'error').length;

    return {
      total,
      online,
      offline,
      error,
      onlinePercentage: total > 0 ? Math.round((online / total) * 100) : 0
    };
  }
}
