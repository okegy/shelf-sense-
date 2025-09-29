import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CorrosionReading {
  id: string;
  productId: string;
  productName: string;
  corrosionRate: number;
  timestamp: string;
  status: 'fresh' | 'moderate' | 'high_risk' | 'spoiled';
  confidence: number;
  sensorLocation: string;
  temperature?: number;
  humidity?: number;
  ethylene?: number;
}

export interface HardwareConfig {
  devicePath: string;
  baudRate: number;
  timeout: number;
  calibrationData?: any;
}

class HardwareService {
  private config: HardwareConfig;
  private isConnected: boolean = false;
  private lastReading: CorrosionReading | null = null;

  constructor(config: HardwareConfig) {
    this.config = config;
  }

  /**
   * Initialize hardware connection and verify device availability
   */
  async initialize(): Promise<boolean> {
    try {
      // Test hardware availability by running a simple command
      const { stderr } = await execAsync('echo "Hardware test"');
      
      if (stderr) {
        console.error('Hardware initialization error:', stderr);
        return false;
      }

      this.isConnected = true;
      console.log('Hardware service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize hardware:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Execute corrosion rate detection command and parse results
   */
  async getCorrosionReading(productId: string, productName: string): Promise<CorrosionReading> {
    if (!this.isConnected) {
      throw new Error('Hardware not connected. Please initialize first.');
    }

    try {
      // Replace this with your actual hardware CLI command
      // Example: await execAsync(`your-hardware-tool.exe --scan --product-id ${productId}`);
      
      // For demonstration, using a mock command that would represent your hardware tool
      const hardwareCommand = `echo "CORROSION_RATE:2.3,CONFIDENCE:0.87,TEMP:22.5,HUMIDITY:65.2,ETHYLENE:0.8"`;
      
      const { stdout, stderr } = await execAsync(hardwareCommand, {
        timeout: this.config.timeout || 10000
      });

      if (stderr) {
        console.error('Hardware command error:', stderr);
        throw new Error(`Hardware error: ${stderr}`);
      }

      // Parse hardware output
      const reading = this.parseHardwareOutput(stdout, productId, productName);
      this.lastReading = reading;
      
      return reading;
    } catch (error: any) {
      console.error('Error getting corrosion reading:', error);
      throw new Error(`Failed to get corrosion reading: ${error.message}`);
    }
  }

  /**
   * Parse hardware CLI output into structured data
   */
  private parseHardwareOutput(output: string, productId: string, productName: string): CorrosionReading {
    try {
      // Parse the hardware output format
      // Adjust this parsing logic based on your actual hardware output format
      const data: any = {};
      
      output.split(',').forEach(pair => {
        const [key, value] = pair.split(':');
        if (key && value) {
          data[key.trim()] = parseFloat(value.trim()) || value.trim();
        }
      });

      const corrosionRate = data.CORROSION_RATE || 0;
      const confidence = data.CONFIDENCE || 0;
      
      // Determine status based on corrosion rate
      let status: 'fresh' | 'moderate' | 'high_risk' | 'spoiled';
      if (corrosionRate < 1.0) {
        status = 'fresh';
      } else if (corrosionRate < 3.0) {
        status = 'moderate';
      } else if (corrosionRate < 5.0) {
        status = 'high_risk';
      } else {
        status = 'spoiled';
      }

      return {
        id: `reading_${Date.now()}`,
        productId,
        productName,
        corrosionRate,
        timestamp: new Date().toISOString(),
        status,
        confidence,
        sensorLocation: 'Hardware Scanner',
        temperature: data.TEMP,
        humidity: data.HUMIDITY,
        ethylene: data.ETHYLENE
      };
    } catch (error) {
      console.error('Error parsing hardware output:', error);
      throw new Error('Failed to parse hardware data');
    }
  }

  /**
   * Get multiple readings for batch processing
   */
  async getBatchReadings(products: Array<{id: string, name: string}>): Promise<CorrosionReading[]> {
    const readings: CorrosionReading[] = [];
    
    for (const product of products) {
      try {
        const reading = await this.getCorrosionReading(product.id, product.name);
        readings.push(reading);
        
        // Add delay between readings to prevent hardware overload
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to get reading for ${product.name}:`, error);
        // Continue with other products even if one fails
      }
    }
    
    return readings;
  }

  /**
   * Calibrate hardware with known samples
   */
  async calibrateHardware(calibrationSamples: Array<{
    productType: string;
    knownCorrosionRate: number;
    expectedReading: number;
  }>): Promise<boolean> {
    try {
      // Execute calibration command with your hardware
      // const calibrationCommand = `your-hardware-tool.exe --calibrate --samples "${JSON.stringify(calibrationSamples)}"`;
      
      console.log('Calibrating hardware with samples:', calibrationSamples);
      
      // Mock calibration for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Hardware calibration completed successfully');
      return true;
    } catch (error) {
      console.error('Hardware calibration failed:', error);
      return false;
    }
  }

  /**
   * Get hardware status and diagnostics
   */
  async getHardwareStatus(): Promise<{
    connected: boolean;
    lastReading: CorrosionReading | null;
    deviceInfo: any;
    diagnostics: any;
  }> {
    try {
      // Get hardware diagnostics
      // const diagnosticsCommand = `your-hardware-tool.exe --status --diagnostics`;
      
      return {
        connected: this.isConnected,
        lastReading: this.lastReading,
        deviceInfo: {
          devicePath: this.config.devicePath,
          baudRate: this.config.baudRate,
          version: '1.0.0'
        },
        diagnostics: {
          temperature: 'OK',
          sensors: 'OK',
          calibration: 'OK',
          lastCheck: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error getting hardware status:', error);
      throw error;
    }
  }

  /**
   * Disconnect and cleanup hardware resources
   */
  async disconnect(): Promise<void> {
    try {
      // Cleanup hardware resources
      this.isConnected = false;
      this.lastReading = null;
      console.log('Hardware service disconnected');
    } catch (error) {
      console.error('Error disconnecting hardware:', error);
    }
  }
}

// Create singleton instance
const defaultConfig: HardwareConfig = {
  devicePath: '/dev/ttyUSB0', // Adjust for Windows: 'COM3' or similar
  baudRate: 9600,
  timeout: 10000
};

export const hardwareService = new HardwareService(defaultConfig);

// Export types and service
export default HardwareService;
