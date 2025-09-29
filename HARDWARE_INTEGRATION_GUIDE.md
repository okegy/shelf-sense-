# Hardware Integration Guide - Corrosion Rate Detection

## Overview

This guide explains how to integrate your hardware-based corrosion rate detection system with the ShelfSense Smart Inventory Management System. The integration allows you to run your hardware tool via command prompt and seamlessly integrate the results into the web application running in Podman containers.

## Architecture

```
Hardware Device → CLI Tool → Node.js Service → REST API → React UI
                     ↓
              Podman Container Environment
```

## Prerequisites

### Hardware Requirements
- Corrosion rate detection hardware device
- USB/Serial connection to host system
- Compatible drivers installed on host system

### Software Requirements
- Podman or Docker installed
- Node.js 18+ (for development)
- Your hardware CLI tool executable

## Integration Steps

### 1. Hardware Service Configuration

The `hardwareService.ts` file is configured to execute your CLI tool. Update the following sections:

```typescript
// Replace this command with your actual hardware tool
const hardwareCommand = `your-hardware-tool.exe --scan --product-id ${productId}`;

// Update device configuration for Windows
const defaultConfig: HardwareConfig = {
  devicePath: 'COM3', // Windows COM port
  baudRate: 9600,
  timeout: 10000
};
```

### 2. CLI Tool Integration

Your hardware CLI tool should output data in a parseable format. The current implementation expects:

```
CORROSION_RATE:2.3,CONFIDENCE:0.87,TEMP:22.5,HUMIDITY:65.2,ETHYLENE:0.8
```

Modify the `parseHardwareOutput` function to match your tool's output format:

```typescript
private parseHardwareOutput(output: string, productId: string, productName: string): CorrosionReading {
  // Customize this parsing logic for your hardware output
  const data: any = {};
  
  // Example for JSON output:
  // const data = JSON.parse(output);
  
  // Example for CSV output:
  // const values = output.split(',');
  // data.CORROSION_RATE = parseFloat(values[0]);
  
  // Current implementation for key:value pairs
  output.split(',').forEach(pair => {
    const [key, value] = pair.split(':');
    if (key && value) {
      data[key.trim()] = parseFloat(value.trim()) || value.trim();
    }
  });
  
  // ... rest of the parsing logic
}
```

### 3. Container Configuration

The `podman-compose.yml` is configured for hardware access:

```yaml
backend:
  # ... other configuration
  volumes:
    - /dev:/dev:ro  # Device access
  devices:
    - /dev/ttyUSB0:/dev/ttyUSB0  # Linux USB device
    - /dev/ttyACM0:/dev/ttyACM0  # Linux ACM device
  privileged: true  # Required for hardware access
```

**For Windows hosts**, update the device mapping:

```yaml
volumes:
  # Windows COM port access
  - //./pipe/docker_engine://./pipe/docker_engine
devices:
  # Windows doesn't use device mapping the same way
  # You may need to run containers with --privileged
```

### 4. Backend API Integration

The backend includes these hardware endpoints:

- `GET /api/hardware/status` - Check hardware connection status
- `POST /api/hardware/initialize` - Initialize hardware connection
- `POST /api/hardware/scan/:productId` - Scan single product
- `POST /api/hardware/batch-scan` - Scan multiple products
- `GET /api/hardware/readings` - Get all readings
- `GET /api/hardware/readings/:productId/latest` - Get latest reading for product

### 5. Database Schema

New tables for hardware integration:

```sql
-- Corrosion readings storage
CREATE TABLE corrosion_readings (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  productName TEXT NOT NULL,
  corrosionRate REAL NOT NULL,
  status TEXT NOT NULL,  -- 'fresh', 'moderate', 'high_risk', 'spoiled'
  confidence REAL,
  sensorLocation TEXT,
  temperature REAL,
  humidity REAL,
  ethylene REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Hardware status tracking
CREATE TABLE hardware_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  devicePath TEXT,
  connected BOOLEAN DEFAULT FALSE,
  lastReading DATETIME,
  diagnostics TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment Instructions

### 1. Prepare Your Hardware Tool

Ensure your CLI tool is accessible from the container:

```bash
# Option 1: Copy tool to project directory
cp /path/to/your-hardware-tool.exe ./hardware/

# Option 2: Mount tool directory
# Add to podman-compose.yml volumes:
# - /path/to/hardware/tools:/hardware/tools:ro
```

### 2. Update Hardware Service

Modify `src/services/hardwareService.ts`:

```typescript
// Update the command path
const hardwareCommand = `/hardware/tools/your-hardware-tool.exe --scan --product-id ${productId}`;

// Or if mounted differently:
const hardwareCommand = `./hardware/your-hardware-tool.exe --scan --product-id ${productId}`;
```

### 3. Deploy with Podman

```bash
# Build and start all services
podman-compose up --build

# Or start specific services
podman-compose up backend frontend mongodb
```

### 4. Test Hardware Integration

1. **Initialize Hardware**:
   ```bash
   curl -X POST http://localhost:5000/api/hardware/initialize \
     -H "Content-Type: application/json" \
     -d '{"devicePath": "COM3", "baudRate": 9600}'
   ```

2. **Test Single Scan**:
   ```bash
   curl -X POST http://localhost:5000/api/hardware/scan/product123 \
     -H "Content-Type: application/json" \
     -d '{"productName": "Apple"}'
   ```

3. **Check Status**:
   ```bash
   curl http://localhost:5000/api/hardware/status
   ```

## UI Features

The Corrosion Detection section provides:

- **Hardware Status Monitor**: Real-time connection status
- **Individual Product Scanning**: Scan specific fruits/vegetables
- **Batch Scanning**: Scan multiple products automatically
- **Reading History**: View past corrosion rate measurements
- **Status Indicators**: Visual freshness status (Fresh, Moderate, High Risk, Spoiled)
- **Environmental Data**: Temperature, humidity, ethylene levels

## Troubleshooting

### Common Issues

1. **Hardware Not Detected**:
   - Check device permissions: `ls -l /dev/ttyUSB*`
   - Add user to dialout group: `sudo usermod -a -G dialout $USER`
   - Verify device path in container

2. **Container Permission Issues**:
   - Ensure `privileged: true` in podman-compose.yml
   - Check device mapping is correct
   - Verify volume mounts for /dev

3. **CLI Tool Execution Fails**:
   - Check tool permissions: `chmod +x your-hardware-tool.exe`
   - Verify tool dependencies are available in container
   - Test tool manually: `docker exec -it inventory-backend ./your-hardware-tool.exe --help`

4. **Windows-Specific Issues**:
   - Use Windows container base image if needed
   - COM port access may require different approach
   - Consider running Podman in WSL2 for better device support

### Debug Commands

```bash
# Check container logs
podman logs inventory-backend

# Access container shell
podman exec -it inventory-backend /bin/bash

# Test hardware tool manually
podman exec -it inventory-backend ./your-hardware-tool.exe --test

# Check device access
podman exec -it inventory-backend ls -l /dev/tty*
```

## Customization

### Adding New Hardware Parameters

1. **Update CorrosionReading Interface**:
   ```typescript
   interface CorrosionReading {
     // ... existing fields
     ph?: number;
     conductivity?: number;
     customParameter?: number;
   }
   ```

2. **Modify Database Schema**:
   ```sql
   ALTER TABLE corrosion_readings ADD COLUMN ph REAL;
   ALTER TABLE corrosion_readings ADD COLUMN conductivity REAL;
   ```

3. **Update Parsing Logic**:
   ```typescript
   // In parseHardwareOutput method
   ph: data.PH,
   conductivity: data.CONDUCTIVITY,
   ```

### Custom Status Thresholds

Modify the status determination logic in `hardwareService.ts`:

```typescript
// Custom thresholds based on product type
const getStatusThresholds = (productType: string) => {
  switch (productType) {
    case 'apple':
      return { fresh: 1.0, moderate: 2.5, high_risk: 4.0 };
    case 'banana':
      return { fresh: 0.8, moderate: 2.0, high_risk: 3.5 };
    default:
      return { fresh: 1.0, moderate: 3.0, high_risk: 5.0 };
  }
};
```

## Security Considerations

1. **Hardware Access**: Privileged containers have elevated permissions
2. **Device Security**: Ensure hardware devices are properly secured
3. **Data Validation**: Validate all hardware output before processing
4. **Network Security**: Use HTTPS in production
5. **Access Control**: Implement proper user authentication for hardware features

## Performance Optimization

1. **Batch Processing**: Use batch scan for multiple products
2. **Caching**: Cache hardware status to reduce API calls
3. **Async Processing**: Use background jobs for long-running scans
4. **Database Indexing**: Add indexes on frequently queried columns

```sql
CREATE INDEX idx_corrosion_readings_product_id ON corrosion_readings(productId);
CREATE INDEX idx_corrosion_readings_timestamp ON corrosion_readings(timestamp);
CREATE INDEX idx_corrosion_readings_status ON corrosion_readings(status);
```

## Production Deployment

1. **Environment Variables**: Use environment variables for configuration
2. **Health Checks**: Implement hardware health monitoring
3. **Logging**: Add comprehensive logging for hardware operations
4. **Monitoring**: Set up alerts for hardware failures
5. **Backup**: Regular backup of corrosion reading data

This integration provides a robust foundation for incorporating your hardware-based corrosion detection system into the ShelfSense platform while maintaining the containerized architecture.
