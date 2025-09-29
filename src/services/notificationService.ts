// Notification Service for ShelfSense
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'alarm';
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'expiry' | 'stock' | 'sensor' | 'sales' | 'system';
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private alarmSound: HTMLAudioElement | null = null;

  constructor() {
    // Initialize alarm sound
    this.initializeAlarmSound();
    
    // Start periodic checks
    this.startPeriodicChecks();
  }

  private initializeAlarmSound() {
    try {
      // Create a simple beep sound using Web Audio API
      this.createBeepSound();
    } catch (error) {
      console.warn('Could not initialize alarm sound:', error);
    }
  }

  private createBeepSound() {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createBeep = (frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Store the beep function
    (this as any).playBeep = () => {
      createBeep(800, 0.2); // 800Hz for 200ms
      setTimeout(() => createBeep(600, 0.2), 300); // 600Hz for 200ms after 300ms
    };
  }

  private startPeriodicChecks() {
    // Check for expiring products every 30 seconds
    setInterval(() => {
      this.checkExpiringProducts();
    }, 30000);

    // Check for low stock every minute
    setInterval(() => {
      this.checkLowStock();
    }, 60000);

    // Check sensor alerts every 2 minutes
    setInterval(() => {
      this.checkSensorAlerts();
    }, 120000);
  }

  private async checkExpiringProducts() {
    try {
      const response = await fetch('http://localhost:5000/api/products/expiring');
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const expiringCount = data.data.length;
        this.addNotification({
          title: '⚠️ Products Expiring Soon',
          message: `${expiringCount} products will expire within 2 days. Consider applying discounts.`,
          type: 'warning',
          priority: 'high',
          category: 'expiry',
          actions: [
            {
              label: 'View Products',
              action: () => {
                // Navigate to inventory section
                window.dispatchEvent(new CustomEvent('navigate-to-inventory'));
              },
              type: 'primary'
            },
            {
              label: 'Apply Discounts',
              action: () => {
                this.applyAutoDiscounts(data.data);
              },
              type: 'secondary'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error checking expiring products:', error);
    }
  }

  private async checkLowStock() {
    try {
      const response = await fetch('http://localhost:5000/api/products/low-stock');
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const lowStockCount = data.data.length;
        this.addNotification({
          title: '📦 Low Stock Alert',
          message: `${lowStockCount} products are running low on stock. Reorder recommended.`,
          type: 'warning',
          priority: 'medium',
          category: 'stock',
          actions: [
            {
              label: 'View Products',
              action: () => {
                window.dispatchEvent(new CustomEvent('navigate-to-inventory'));
              },
              type: 'primary'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  }

  private async checkSensorAlerts() {
    try {
      const response = await fetch('http://localhost:5000/api/sensors/offline');
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        const offlineCount = data.data.length;
        this.addNotification({
          title: '🔴 Sensor Alert',
          message: `${offlineCount} IoT sensors are offline. Check connections immediately.`,
          type: 'error',
          priority: 'critical',
          category: 'sensor',
          actions: [
            {
              label: 'Check Sensors',
              action: () => {
                window.dispatchEvent(new CustomEvent('navigate-to-iot'));
              },
              type: 'primary'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error checking sensor alerts:', error);
    }
  }

  private async applyAutoDiscounts(expiringProducts: any[]) {
    try {
      // Apply automatic discounts to expiring products
      for (const product of expiringProducts) {
        const discountPercent = product.status === 'danger' ? 30 : 15;
        const discountedPrice = product.price * (1 - discountPercent / 100);
        
        await fetch(`http://localhost:5000/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...product,
            discountedPrice: Math.round(discountedPrice * 100) / 100
          })
        });
      }
      
      this.addNotification({
        title: '✅ Auto-Discount Applied',
        message: `Automatic discounts applied to ${expiringProducts.length} expiring products.`,
        type: 'success',
        priority: 'medium',
        category: 'system'
      });
    } catch (error) {
      console.error('Error applying auto discounts:', error);
    }
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Play alarm sound for critical notifications
    if (notification.priority === 'critical' || notification.type === 'alarm') {
      this.playAlarm();
    }

    // Notify listeners
    this.notifyListeners();

    // Show browser notification if permission granted
    this.showBrowserNotification(newNotification);

    return newNotification.id;
  }

  private playAlarm() {
    try {
      if ((this as any).playBeep) {
        (this as any).playBeep();
      }
    } catch (error) {
      console.warn('Could not play alarm sound:', error);
    }
  }

  private async showBrowserNotification(notification: Notification) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id
          });
        }
      }
    }
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.notifyListeners();
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Manual triggers for testing
  triggerTestAlarm() {
    this.addNotification({
      title: '🚨 TEST ALARM',
      message: 'This is a test alarm notification with sound.',
      type: 'alarm',
      priority: 'critical',
      category: 'system'
    });
  }

  triggerSalesAlert(amount: number) {
    this.addNotification({
      title: '💰 Sale Completed',
      message: `New sale of ₹${amount} has been processed successfully.`,
      type: 'success',
      priority: 'low',
      category: 'sales'
    });
  }

  triggerTemperatureAlert(location: string, temperature: number) {
    this.addNotification({
      title: '🌡️ Temperature Alert',
      message: `${location} temperature is ${temperature}°C - outside safe range!`,
      type: 'error',
      priority: 'critical',
      category: 'sensor',
      actions: [
        {
          label: 'Check Sensors',
          action: () => {
            window.dispatchEvent(new CustomEvent('navigate-to-iot'));
          },
          type: 'primary'
        }
      ]
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
