# Aadhaar Demo System - Secure Identity Management

🔐 A secure web-based identity management system similar to Aadhaar, built for demonstration purposes. Features biometric fingerprint authentication, user registration, and secure local data storage.

## ✨ Features

- **🆔 User Registration**: Complete identity registration with personal details
- **👆 Fingerprint Authentication**: WebAuthn-compatible biometric authentication
- **🔒 Secure Storage**: Encrypted local SQLite database storage
- **✅ Identity Verification**: Real-time fingerprint verification and user lookup
- **🎨 Modern UI**: Beautiful React-based user interface with responsive design
- **🛡️ Privacy-First**: All data stored locally on your device, no cloud dependencies

## 🏗️ System Architecture

### Backend (Node.js + Express)
- **Database**: SQLite with encrypted fingerprint storage
- **API**: RESTful endpoints for registration and verification
- **Security**: Helmet.js, rate limiting, input validation
- **Encryption**: AES-256 for sensitive data protection

### Frontend (React + Vite)
- **Framework**: Modern React with functional components and hooks
- **Routing**: React Router for navigation
- **Styling**: Custom CSS with gradient themes and animations
- **Icons**: Lucide React for consistent iconography
- **WebAuthn**: Browser-based fingerprint capture with fallback simulation

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Modern Browser** with WebAuthn support (Chrome, Firefox, Edge)
- **Windows Hello** (optional, for real fingerprint capture)

### Easy Setup (Recommended)

1. **Run the startup script**:
   ```powershell
   .\start-system.ps1
   ```

2. **Open your browser** to:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Manual Setup

1. **Install backend dependencies**:
   ```bash
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Start backend server**:
   ```bash
   npm run dev
   ```

4. **Start frontend (in new terminal)**:
   ```bash
   cd frontend
   npm run dev
   ```

## 📱 How to Use

### 1. User Registration
1. Click "Register New User" on the dashboard
2. Fill in personal information (name, age, gender, location)
3. Proceed to fingerprint registration
4. Capture fingerprint using WebAuthn or simulation
5. Receive unique 12-digit ID number

### 2. Identity Verification
1. Click "Verify Identity" on the dashboard
2. Scan your registered fingerprint
3. View verified user details with ✅ confirmation
4. See complete identity information securely retrieved

## 🔧 API Endpoints

### User Registration
```http
POST /api/register
Content-Type: application/json

{
  "uniqueNumber": "123456789012",  // optional
  "name": "John Doe",
  "age": 30,
  "gender": "Male",
  "location": "New York, NY",
  "phoneNumber": "+1234567890",    // optional
  "email": "john@example.com"      // optional
}
```

### Fingerprint Registration
```http
POST /api/register-fingerprint
Content-Type: application/json

{
  "userId": 1,
  "fingerprintData": "base64_encoded_fingerprint_data"
}
```

### Identity Verification
```http
POST /api/verify-fingerprint
Content-Type: application/json

{
  "fingerprintData": "base64_encoded_fingerprint_data"
}
```

### Health Check
```http
GET /api/health
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    location TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Fingerprints Table
```sql
CREATE TABLE fingerprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fingerprint_hash TEXT NOT NULL,
    fingerprint_template TEXT NOT NULL,  -- encrypted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🔐 Security Features

- **Data Encryption**: AES-256 encryption for fingerprint templates
- **Secure Hashing**: SHA-256 hashing for fingerprint matching
- **Rate Limiting**: API endpoint protection against abuse
- **Input Validation**: Comprehensive server-side validation
- **HTTPS Ready**: Production-ready SSL/TLS configuration
- **Local Storage**: No external dependencies or cloud storage

## 📁 Project Structure

```
E-Vote/
├── 📁 frontend/                 # React application
│   ├── 📁 src/
│   │   ├── 📁 components/       # React components
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── Register.jsx     # User registration
│   │   │   ├── Verify.jsx       # Identity verification
│   │   │   └── FingerprintCapture.jsx  # Biometric capture
│   │   └── 📁 styles/           # CSS stylesheets
│   └── package.json
├── 📄 server.js                 # Express backend server
├── 📄 database.js               # SQLite database manager
├── 📄 package.json              # Backend dependencies
├── 📄 start-system.ps1          # Startup script
└── 📄 aadhaar_demo.db           # SQLite database (auto-created)
```

## 🖥️ Browser Compatibility

| Browser | WebAuthn Support | Fingerprint Capture | Status |
|---------|------------------|---------------------|--------|
| Chrome 67+ | ✅ | ✅ | Full Support |
| Firefox 60+ | ✅ | ✅ | Full Support |
| Edge 79+ | ✅ | ✅ | Full Support |
| Safari 14+ | ✅ | ⚠️ | Limited |
| Mobile Browsers | ✅ | ⚠️ | Simulation Mode |

## 🚨 Demo Limitations

- **Local Development**: Not production-ready, requires additional security hardening
- **Fingerprint Simulation**: Falls back to simulated fingerprints when WebAuthn unavailable
- **Single Device**: Database stored locally, not synchronized across devices
- **Demo Purpose**: Educational demonstration, not for real identity management

## 🛠️ Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill processes using ports 3000 or 5173
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Dependencies Not Installing**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**WebAuthn Not Working**
- Ensure you're using HTTPS or localhost
- Check browser console for errors
- Use fingerprint simulation as fallback

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Additional security auditing
- Database encryption at rest
- User session management
- Multi-factor authentication
- Compliance with data protection regulations

## 📄 License

MIT License - See LICENSE file for details.

---

**⚠️ Disclaimer**: This system is for educational and demonstration purposes only. Not intended for production use with real personal data.
