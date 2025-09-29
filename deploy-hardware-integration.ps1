# ShelfSense Hardware Integration Deployment Script
# PowerShell script for Windows deployment with Podman

param(
    [switch]$Build,
    [switch]$Test,
    [switch]$Deploy,
    [switch]$Clean,
    [string]$HardwareDevice = "COM3",
    [int]$BaudRate = 9600
)

Write-Host "🚀 ShelfSense Hardware Integration Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Configuration
$PROJECT_DIR = Get-Location
$FRONTEND_PORT = 5173
$BACKEND_PORT = 5000
$MONGODB_PORT = 27017

function Write-Status {
    param([string]$Message, [string]$Color = "Yellow")
    Write-Host "📋 $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Podman
    try {
        $podmanVersion = podman --version
        Write-Success "Podman found: $podmanVersion"
    }
    catch {
        Write-Error "Podman not found. Please install Podman Desktop."
        exit 1
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    }
    catch {
        Write-Error "Node.js not found. Please install Node.js 18+."
        exit 1
    }
    
    # Check project files
    $requiredFiles = @(
        "package.json",
        "podman-compose.yml",
        "src/services/hardwareService.ts",
        "src/components/sections/CorrosionDetectionSection.tsx",
        "backend-sqlite.js"
    )
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Success "Found: $file"
        } else {
            Write-Error "Missing: $file"
            exit 1
        }
    }
}

function Install-Dependencies {
    Write-Status "Installing dependencies..."
    
    # Frontend dependencies
    Write-Status "Installing frontend dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install frontend dependencies"
        exit 1
    }
    
    # Backend dependencies
    Write-Status "Installing backend dependencies..."
    Set-Location backend
    npm install
    Set-Location ..
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install backend dependencies"
        exit 1
    }
    
    Write-Success "Dependencies installed successfully"
}

function Build-Containers {
    Write-Status "Building containers..."
    
    # Stop existing containers
    podman-compose down 2>$null
    
    # Build containers
    podman-compose build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build containers"
        exit 1
    }
    
    Write-Success "Containers built successfully"
}

function Test-HardwareIntegration {
    Write-Status "Testing hardware integration..."
    
    # Start containers
    Write-Status "Starting containers for testing..."
    podman-compose up -d
    
    # Wait for services to be ready
    Write-Status "Waiting for services to start..."
    Start-Sleep -Seconds 30
    
    # Test backend health
    try {
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:$BACKEND_PORT/health" -Method GET
        Write-Success "Backend health check passed"
        Write-Host "Backend status: $($healthResponse.status)" -ForegroundColor Cyan
    }
    catch {
        Write-Error "Backend health check failed: $($_.Exception.Message)"
    }
    
    # Test hardware status endpoint
    try {
        $hardwareResponse = Invoke-RestMethod -Uri "http://localhost:$BACKEND_PORT/api/hardware/status" -Method GET
        Write-Success "Hardware status endpoint accessible"
        Write-Host "Hardware connected: $($hardwareResponse.data.connected)" -ForegroundColor Cyan
    }
    catch {
        Write-Error "Hardware status endpoint failed: $($_.Exception.Message)"
    }
    
    # Test hardware initialization
    try {
        $initBody = @{
            devicePath = $HardwareDevice
            baudRate = $BaudRate
        } | ConvertTo-Json
        
        $initResponse = Invoke-RestMethod -Uri "http://localhost:$BACKEND_PORT/api/hardware/initialize" -Method POST -Body $initBody -ContentType "application/json"
        Write-Success "Hardware initialization test passed"
        Write-Host "Initialization result: $($initResponse.message)" -ForegroundColor Cyan
    }
    catch {
        Write-Error "Hardware initialization test failed: $($_.Exception.Message)"
    }
    
    # Test frontend accessibility
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:$FRONTEND_PORT" -Method GET -UseBasicParsing
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Success "Frontend accessible"
        }
    }
    catch {
        Write-Error "Frontend not accessible: $($_.Exception.Message)"
    }
    
    Write-Success "Hardware integration tests completed"
}

function Deploy-Application {
    Write-Status "Deploying ShelfSense with Hardware Integration..."
    
    # Create hardware directory if it doesn't exist
    if (!(Test-Path "hardware")) {
        New-Item -ItemType Directory -Path "hardware"
        Write-Status "Created hardware directory for CLI tools"
    }
    
    # Update podman-compose.yml for Windows if needed
    $composeContent = Get-Content "podman-compose.yml" -Raw
    if ($composeContent -match "/dev/ttyUSB0") {
        Write-Status "Detected Linux device paths. Consider updating for Windows deployment."
        Write-Host "Windows COM ports: COM1, COM2, COM3, etc." -ForegroundColor Yellow
        Write-Host "Current hardware device: $HardwareDevice" -ForegroundColor Yellow
    }
    
    # Start all services
    Write-Status "Starting all services..."
    podman-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployment successful!"
        Write-Host ""
        Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost:$FRONTEND_PORT" -ForegroundColor White
        Write-Host "   Backend API: http://localhost:$BACKEND_PORT" -ForegroundColor White
        Write-Host "   MongoDB: localhost:$MONGODB_PORT" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 Hardware Configuration:" -ForegroundColor Cyan
        Write-Host "   Device: $HardwareDevice" -ForegroundColor White
        Write-Host "   Baud Rate: $BaudRate" -ForegroundColor White
        Write-Host ""
        Write-Host "🎤 Voice Commands Available:" -ForegroundColor Cyan
        Write-Host "   'Go to corrosion detection'" -ForegroundColor White
        Write-Host "   'Check freshness'" -ForegroundColor White
        Write-Host "   'Scan for corrosion'" -ForegroundColor White
        Write-Host "   'Batch scan products'" -ForegroundColor White
        Write-Host "   'Initialize hardware'" -ForegroundColor White
        Write-Host ""
        Write-Host "📚 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Navigate to Corrosion Detection section" -ForegroundColor White
        Write-Host "   2. Initialize hardware connection" -ForegroundColor White
        Write-Host "   3. Test with sample products" -ForegroundColor White
        Write-Host "   4. Configure your CLI tool path in hardwareService.ts" -ForegroundColor White
    } else {
        Write-Error "Deployment failed"
        exit 1
    }
}

function Clean-Environment {
    Write-Status "Cleaning environment..."
    
    # Stop and remove containers
    podman-compose down
    
    # Remove images (optional)
    $removeImages = Read-Host "Remove container images? (y/N)"
    if ($removeImages -eq "y" -or $removeImages -eq "Y") {
        podman image prune -f
        Write-Success "Container images removed"
    }
    
    # Clean node_modules (optional)
    $cleanModules = Read-Host "Remove node_modules? (y/N)"
    if ($cleanModules -eq "y" -or $cleanModules -eq "Y") {
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force backend/node_modules -ErrorAction SilentlyContinue
        Write-Success "Node modules removed"
    }
    
    Write-Success "Environment cleaned"
}

function Show-Usage {
    Write-Host ""
    Write-Host "Usage: ./deploy-hardware-integration.ps1 [OPTIONS]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  -Build              Build containers only" -ForegroundColor White
    Write-Host "  -Test               Run integration tests" -ForegroundColor White
    Write-Host "  -Deploy             Full deployment" -ForegroundColor White
    Write-Host "  -Clean              Clean environment" -ForegroundColor White
    Write-Host "  -HardwareDevice     Hardware device path (default: COM3)" -ForegroundColor White
    Write-Host "  -BaudRate           Baud rate (default: 9600)" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  ./deploy-hardware-integration.ps1 -Deploy" -ForegroundColor White
    Write-Host "  ./deploy-hardware-integration.ps1 -Test -HardwareDevice COM4" -ForegroundColor White
    Write-Host "  ./deploy-hardware-integration.ps1 -Build -Deploy" -ForegroundColor White
    Write-Host ""
}

# Main execution
try {
    if (-not ($Build -or $Test -or $Deploy -or $Clean)) {
        Show-Usage
        exit 0
    }
    
    Test-Prerequisites
    
    if ($Clean) {
        Clean-Environment
    }
    
    if ($Build -or $Deploy) {
        Install-Dependencies
        Build-Containers
    }
    
    if ($Test) {
        Test-HardwareIntegration
    }
    
    if ($Deploy) {
        Deploy-Application
    }
    
    Write-Success "All operations completed successfully!"
}
catch {
    Write-Error "Script execution failed: $($_.Exception.Message)"
    exit 1
}
