import { Alert } from '../types';
import { ProductModel } from './Product';
import { IoTSensorModel } from './IoTSensor';

const generateId = () => Math.random().toString(36).substr(2, 9);

export class AlertModel {
  private static alerts: Alert[] = [
    {
      id: 'alert-001',
      type: 'expiry',
      severity: 'high',
      title: 'Items Expiring Soon',
      message: '5 products will expire within 24 hours',
      timestamp: new Date('2024-01-15T09:00:00Z'),
      isRead: false,
      productId: '2',
      createdAt: new Date('2024-01-15T09:00:00Z')
    },
    {
      id: 'alert-002',
      type: 'stock',
      severity: 'medium',
      title: 'Low Stock Alert',
      message: 'Coca Cola 500ml stock is running low (12 units left)',
      timestamp: new Date('2024-01-15T08:30:00Z'),
      isRead: false,
      productId: '5',
      createdAt: new Date('2024-01-15T08:30:00Z')
    },
    {
      id: 'alert-003',
      type: 'sensor',
      severity: 'critical',
      title: 'Temperature Alert',
      message: 'Dairy section temperature exceeded safe limits (8°C)',
      timestamp: new Date('2024-01-15T07:45:00Z'),
      isRead: true,
      createdAt: new Date('2024-01-15T07:45:00Z')
    }
  ];

  static async findAll(): Promise<Alert[]> {
    return this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static async findById(id: string): Promise<Alert | null> {
    return this.alerts.find(alert => alert.id === id) || null;
  }

  static async findUnread(): Promise<Alert[]> {
    return this.alerts.filter(alert => !alert.isRead);
  }

  static async findByType(type: string): Promise<Alert[]> {
    return this.alerts.filter(alert => alert.type === type);
  }

  static async markAsRead(id: string): Promise<Alert | null> {
    const alertIndex = this.alerts.findIndex(alert => alert.id === id);
    if (alertIndex === -1) return null;

    this.alerts[alertIndex].isRead = true;
    return this.alerts[alertIndex];
  }

  static async markAllAsRead(): Promise<number> {
    let count = 0;
    this.alerts.forEach(alert => {
      if (!alert.isRead) {
        alert.isRead = true;
        count++;
      }
    });
    return count;
  }

  static async create(alertData: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    const newAlert: Alert = {
      id: generateId(),
      ...alertData,
      createdAt: new Date()
    };

    this.alerts.push(newAlert);
    return newAlert;
  }

  static async delete(id: string): Promise<boolean> {
    const initialLength = this.alerts.length;
    this.alerts = this.alerts.filter(alert => alert.id !== id);
    return this.alerts.length < initialLength;
  }

  // Auto-generate alerts based on system conditions
  static async generateExpiryAlerts(): Promise<Alert[]> {
    const expiringProducts = await ProductModel.getExpiringItems(1);
    const newAlerts: Alert[] = [];

    for (const product of expiringProducts) {
      const existingAlert = this.alerts.find(alert =>
        alert.type === 'expiry' &&
        alert.productId === product.id &&
        !alert.isRead
      );

      if (!existingAlert) {
        const alert = await this.create({
          type: 'expiry',
          severity: 'high',
          title: 'Product Expiring Soon',
          message: `${product.name} will expire tomorrow`,
          timestamp: new Date(),
          isRead: false,
          productId: product.id
        });
        newAlerts.push(alert);
      }
    }

    return newAlerts;
  }

  static async generateStockAlerts(): Promise<Alert[]> {
    const lowStockProducts = await ProductModel.getLowStockItems(10);
    const newAlerts: Alert[] = [];

    for (const product of lowStockProducts) {
      const existingAlert = this.alerts.find(alert =>
        alert.type === 'stock' &&
        alert.productId === product.id &&
        !alert.isRead
      );

      if (!existingAlert) {
        const alert = await this.create({
          type: 'stock',
          severity: product.count <= 5 ? 'high' : 'medium',
          title: 'Low Stock Alert',
          message: `${product.name} stock is running low (${product.count} units left)`,
          timestamp: new Date(),
          isRead: false,
          productId: product.id
        });
        newAlerts.push(alert);
      }
    }

    return newAlerts;
  }

  static async generateSensorAlerts(): Promise<Alert[]> {
    const sensorsWithIssues = await IoTSensorModel.getSensorsWithAlerts();
    const newAlerts: Alert[] = [];

    for (const sensor of sensorsWithIssues) {
      const existingAlert = this.alerts.find(alert =>
        alert.type === 'sensor' &&
        alert.message.includes(sensor.location) &&
        !alert.isRead
      );

      if (!existingAlert) {
        let message = '';
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

        if (sensor.status === 'offline') {
          message = `${sensor.location} sensor is offline`;
          severity = 'high';
        } else if (sensor.status === 'error') {
          message = `${sensor.location} ${sensor.type} reading is out of range: ${sensor.value}${sensor.unit}`;
          severity = sensor.value < sensor.threshold.min || sensor.value > sensor.threshold.max ? 'critical' : 'high';
        }

        if (message) {
          const alert = await this.create({
            type: 'sensor',
            severity,
            title: 'Sensor Alert',
            message,
            timestamp: new Date(),
            isRead: false
          });
          newAlerts.push(alert);
        }
      }
    }

    return newAlerts;
  }

  static async getAlertStats() {
    const total = this.alerts.length;
    const unread = this.alerts.filter(a => !a.isRead).length;
    const byType = this.alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      byType,
      bySeverity
    };
  }
}
