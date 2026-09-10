# Enhanced E-Voting System Startup Script
Write-Host "🚀 Starting Enhanced E-Voting System..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Start backend server in background
Write-Host "🔧 Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend development server
Write-Host "🎨 Starting frontend development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/frontend'; npm run dev"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Enhanced E-Voting System is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access Points:" -ForegroundColor White
Write-Host "   • Main Dashboard: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   • Backend API: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Available Features:" -ForegroundColor White
Write-Host "   • User Registration with Biometric Auth" -ForegroundColor Gray
Write-Host "   • Fingerprint-based Identity Verification" -ForegroundColor Gray
Write-Host "   • Encrypted Blockchain Voting (Anonymous)" -ForegroundColor Gray
Write-Host "   • Real-time Results Dashboard (/results)" -ForegroundColor Gray
Write-Host "   • Admin Management Panel (/admin)" -ForegroundColor Gray
Write-Host "   • Voter Receipt Verification (/verify-receipt)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 Demo Credentials:" -ForegroundColor Yellow
Write-Host "   • Admin Password: admin123" -ForegroundColor Gray
Write-Host "   • Emergency Delete Password: DELETE_ALL_DATA_CONFIRM_2024" -ForegroundColor Red
Write-Host ""
Write-Host "🔒 Privacy & Security Features:" -ForegroundColor Cyan
Write-Host "   • Full Voter Anonymity - votes cannot be linked to voters" -ForegroundColor Gray
Write-Host "   • Receipt Verification - confirm vote exists without revealing choice" -ForegroundColor Gray
Write-Host "   • Blockchain Privacy - encrypted immutable vote storage" -ForegroundColor Gray
Write-Host "   • Emergency Data Deletion - admin can clear all data" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Development Windows:" -ForegroundColor White
Write-Host "   • Backend server: Minimized PowerShell window" -ForegroundColor Yellow
Write-Host "   • Frontend server: New PowerShell window" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Please wait 10-15 seconds for all services to fully start" -ForegroundColor Orange
Write-Host ""
Write-Host "📆 Usage Guide:" -ForegroundColor White
Write-Host "   1. Register new users with fingerprint" -ForegroundColor Gray
Write-Host "   2. Verify identity and cast anonymous votes" -ForegroundColor Gray
Write-Host "   3. View live results in real-time" -ForegroundColor Gray
Write-Host "   4. Use admin panel for system management" -ForegroundColor Gray
Write-Host "   5. Verify vote receipts without revealing choices" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️ Emergency Controls:" -ForegroundColor Yellow
Write-Host "   • Admin can delete ALL system data (irreversible)" -ForegroundColor Red
Write-Host "   • Requires confirmation password for safety" -ForegroundColor Red
Write-Host ""
Write-Host "📖 To stop the system:" -ForegroundColor White
Write-Host "   • Close both PowerShell windows or press Ctrl+C in each" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Open your browser and go to: http://localhost:5173" -ForegroundColor Magenta
