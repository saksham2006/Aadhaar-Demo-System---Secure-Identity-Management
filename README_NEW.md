# Enhanced E-Voting System

A comprehensive blockchain-based e-voting system with biometric authentication, real-time results, admin controls, and vote decryption capabilities.

## 🚀 Features

### Core Functionality
- **🔐 Biometric Authentication**: Secure user registration and verification using fingerprint technology
- **⛓️ Blockchain Integration**: Immutable vote storage on Ethereum blockchain with encryption
- **📊 Real-time Results**: Live vote tallies and election results dashboard
- **🔒 Privacy Protection**: Anonymous voting with encrypted vote choices
- **⚙️ Admin Controls**: Comprehensive system management and vote administration
- **📋 Audit Trail**: Complete transaction history and vote decryption for transparency

### Enhanced Components
- **📈 Live Results Dashboard**: Real-time vote tracking with charts and statistics
- **🛠️ Admin Management Panel**: User management, vote controls, and system statistics
- **🔓 Vote Decryption Interface**: Authorized access to decrypt votes for audit purposes
- **📱 Responsive Design**: Mobile-friendly interface with modern UI
- **🔍 Analytics & Reporting**: Vote statistics, turnout tracking, and detailed reporting

## 🏗️ Technology Stack

- **Frontend**: React.js with Vite, Lucide React icons, Modern CSS
- **Backend**: Node.js with Express, SQLite database
- **Blockchain**: Ethereum with Hardhat, Solidity smart contracts
- **Security**: WebAuthn biometric authentication, Crypto encryption
- **Development**: Hot reload, ESLint, Modern JavaScript

## 📋 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│  (React App)    │◄──►│ (Node.js API)   │◄──►│ (Smart Contract)│
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • User Auth     │    │ • Vote Storage  │
│ • Voting UI     │    │ • Vote API      │    │ • Encryption    │
│ • Results       │    │ • Database      │    │ • Immutability  │
│ • Admin Panel   │    │ • Fingerprints  │    │ • Transparency  │
│ • Decryption    │    │ • Security      │    │ • Audit Trail   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Modern web browser** with WebAuthn support
- **Windows PowerShell** (for the startup script)

### Quick Start

1. **Clone the repository**:
```bash
git clone <repository-url>
cd E-Vote
```

2. **Run the startup script** (Windows):
```powershell
.\start-system.ps1
```

The script will:
- ✅ Install all dependencies
- 🚀 Start the backend server
- 🎨 Launch the frontend
- 📱 Open your browser automatically

### Manual Setup

If you prefer manual control:

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

4. **Start frontend** (in new terminal):
```bash
cd frontend
npm run dev
```

## 📱 System Usage

### 🏠 Main Dashboard (`/`)
- Overview of system features
- Navigation to all components
- System status and statistics
- Quick access to all functions

### 👤 User Registration (`/register`)
1. Enter personal details
2. Capture fingerprint biometric
3. Store encrypted user data
4. Generate unique ID

### 🔍 Identity Verification (`/verify`)
1. Scan registered fingerprint
2. Verify against stored templates
3. Retrieve user information
4. Proceed to voting

### 🗳️ Voting Interface (`/voting`)
1. Select candidate from list
2. Cast encrypted vote on blockchain
3. Receive transaction receipt
4. Update database status

### 📊 Live Results (`/results`)
- Real-time vote tallies
- Interactive charts and graphs
- Winner announcements
- Voting statistics
- Auto-refresh capabilities

### ⚙️ Admin Panel (`/admin`)
**Authentication Required** (Password: `admin123`)

**Features:**
- 📈 System overview and statistics
- 👥 User management and controls
- 🗳️ Vote management and reset
- ⛓️ Blockchain data viewing
- 🔧 System configuration

### 🔓 Vote Decryption (`/decrypt`)
**Private Key Required** (Demo: `demo_private_key_for_decryption`)

**Features:**
- 🔐 Encrypted vote viewing
- 🔓 Individual vote decryption
- 📊 Batch decryption capabilities
- 📋 Audit log maintenance
- 💾 Export decrypted results

## 🔌 API Documentation

### User Management Endpoints
```
POST   /api/register              # Register new user
POST   /api/register-fingerprint  # Store biometric data
POST   /api/verify-fingerprint    # Verify user identity
GET    /api/user/:uniqueNumber    # Get user details
```

### Voting Endpoints
```
GET    /api/blockchain/candidates    # Get all candidates
POST   /api/voting/cast             # Cast encrypted vote
GET    /api/voting/status/:userId   # Check voting status
GET    /api/blockchain/results      # Get live results
GET    /api/blockchain/encrypted-votes # Get encrypted votes (admin)
```

### Administration Endpoints
```
DELETE /api/admin/clear-database  # Clear all data
POST   /api/admin/reset-votes     # Reset all votes
GET    /api/admin/stats           # Get system statistics
GET    /api/health                # Health check
```

## 🔒 Security Features

### Authentication & Privacy
- **🔐 Biometric Security**: WebAuthn fingerprint authentication
- **🔒 Data Encryption**: AES-256 encryption for sensitive data
- **🎭 Anonymous Voting**: Votes cannot be traced to individuals
- **🛡️ Input Validation**: Comprehensive data sanitization
- **⚡ Rate Limiting**: API abuse protection

### Blockchain Security
- **⛓️ Immutable Storage**: Votes permanently stored on blockchain
- **🔐 Encrypted Votes**: Vote choices encrypted with public key
- **📝 Smart Contracts**: Auditable and transparent voting logic
- **🧾 Receipt System**: Cryptographic proof of vote casting
- **🔍 Audit Trail**: Complete transaction history

## 🛠️ Development

### Project Structure
```
E-Vote/
├── 📁 contracts/              # Smart contracts (Solidity)
│   ├── EVoting.sol            # Main voting contract
│   └── Lock.sol               # Example contract
├── 📁 frontend/               # React application
│   ├── 📁 src/
│   │   ├── 📁 components/     # React components
│   │   ├── 📁 styles/         # CSS stylesheets
│   │   └── App.jsx            # Main app component
│   └── package.json           # Frontend dependencies
├── 📁 scripts/               # Deployment scripts
├── 📁 test/                  # Contract tests
├── server.js                 # Express backend server
├── database.js               # SQLite database operations
├── start-system.ps1          # Windows startup script
└── README.md                 # This documentation
```

### Smart Contract Functions

#### Core Voting Functions
```solidity
voteWithEncryption(candidateId, encryptedChoice, voterHash) # Cast encrypted vote
getAllCandidates() returns (candidates[])                   # Get candidate list
getResults() returns (totalVotes, candidates, isActive)     # Get voting results
getAllEncryptedVotes() returns (encryptedVotes[])          # Get encrypted votes (admin)
```

#### Administrative Functions
```solidity
addCandidate(name, party)      # Add new candidate (admin)
resetVotes()                   # Reset all votes (admin)
toggleVoting()                 # Enable/disable voting (admin)
emergencyReset()               # Complete system reset (admin)
```

### Testing

**Run smart contract tests**:
```bash
npx hardhat test
```

**Test coverage**:
```bash
npx hardhat coverage
```

## 🔧 Configuration

### Environment Variables
```env
PORT=3000                    # Backend server port
NODE_ENV=development         # Environment mode
DB_PATH=./aadhaar_demo.db    # Database file path
```

### Demo Credentials
```
Admin Password: admin123
Decryption Key: demo_private_key_for_decryption
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| WebAuthn not working | Use HTTPS or localhost, modern browser required |
| Blockchain connection failed | Ensure Hardhat node is running on port 8545 |
| Port conflicts | Change ports in server.js and frontend config |
| Database locked | Restart system, close all connections |
| Fingerprint not recognized | Re-register user, ensure clean sensor |

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure security best practices

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs or features
- **Discussions**: Use GitHub discussions for questions

---

**🎯 Ready to revolutionize voting with blockchain technology!** 🚀