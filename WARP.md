# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Quick Start
```powershell
# Start entire system (recommended)
.\start-system.ps1
```

### Backend Development
```bash
# Start backend server in development mode
npm run dev

# Start backend in production mode
npm start

# Install all dependencies (backend + frontend)
npm run setup
```

### Frontend Development
```bash
# Start frontend development server
cd frontend
npm run dev

# Build frontend for production
cd frontend
npm run build

# Lint frontend code
cd frontend
npm run lint

# Preview production build
cd frontend
npm run preview
```

### Blockchain Development
```bash
# Compile smart contracts
npx hardhat compile

# Deploy contracts to local network
npx hardhat run scripts/deploy.js --network localhost

# Start local Hardhat blockchain node
npx hardhat node

# Run contract tests
npx hardhat test
```

### Testing Individual Components
```bash
# Test backend API endpoints
curl http://localhost:3000/api/health

# Test specific user lookup
curl http://localhost:3000/api/user/123456789012

# Test frontend components by navigating to:
# http://localhost:5173/register
# http://localhost:5173/verify  
# http://localhost:5173/voting
# http://localhost:5173/results
# http://localhost:5173/admin
# http://localhost:5173/receipt
```

## Architecture Overview

### System Structure
This is a **hybrid identity management and e-voting system** combining Aadhaar-like biometric authentication with blockchain-based anonymous voting.

**Two Main Subsystems:**
1. **Identity Management** (Aadhaar-like): Biometric user registration and verification
2. **E-Voting System**: Anonymous blockchain-based voting with encrypted vote storage

### Technology Stack

**Backend:**
- **Node.js/Express** server on port 3000
- **SQLite** database for identity data (`aadhaar_demo.db`)
- **Web3.js** for blockchain interaction
- **AES-256** encryption for sensitive data
- **WebAuthn** for fingerprint capture

**Frontend:**
- **React** with functional components and hooks
- **React Router** for navigation
- **Vite** development server on port 5173
- **TailwindCSS** for styling
- **Lucide React** icons

**Blockchain:**
- **Hardhat** development environment
- **Solidity 0.8.28** smart contracts
- **Local Ethereum node** on port 8545
- **EVoting.sol** contract with encrypted vote storage

### Database Schema

**Core Tables:**
- `users`: Personal identity information (name, age, gender, location, unique 12-digit ID)
- `fingerprints`: Encrypted biometric templates with SHA-256 hashes
- `voting_status`: Tracks who has voted (without vote choice)
- `votes`: Vote details for receipt verification only

### Smart Contract Architecture

**EVoting.sol** provides:
- Public vote tallying (real-time results)
- Encrypted vote storage (immutable audit trail)
- Anonymous voter identification using hashes
- Receipt generation for verification
- Admin controls for demo purposes

### Data Flow

1. **User Registration**: Personal data → SQLite + encrypted fingerprint storage
2. **Identity Verification**: Fingerprint hash matching → user lookup
3. **Vote Casting**: Dual recording (blockchain tally + encrypted audit)
4. **Results**: Live blockchain data aggregation
5. **Receipt Verification**: Transaction proof without revealing vote choice

## Key Components

### Backend API Structure (`server.js`)
- RESTful endpoints for identity management (`/api/register`, `/api/verify-fingerprint`)
- Blockchain voting endpoints (`/api/blockchain/candidates`, `/api/voting/cast`)
- Admin controls (`/api/admin/reset-votes`, `/api/admin/emergency-delete-all`)
- Receipt verification (`/api/voting/verify-receipt`)

### Frontend React Components
- **Dashboard.jsx**: Main navigation hub
- **Register.jsx**: Multi-step user registration with biometrics
- **Verify.jsx**: Identity verification portal
- **Voting.jsx**: Anonymous voting interface
- **Results.jsx**: Live election results display
- **AdminPanel.jsx**: System management console
- **ReceiptVerification.jsx**: Vote receipt validation

### Blockchain Integration
- **contracts/EVoting.sol**: Main voting smart contract
- **scripts/deploy.js**: Contract deployment script
- **hardhat.config.js**: Blockchain development configuration

## Privacy & Security Features

### Voter Anonymity
- Votes cannot be linked to voter identities
- Hash-based voter identification (no personal data on blockchain)
- Encrypted vote choices for audit without revealing selections

### Data Protection
- **AES-256 encryption** for fingerprint templates
- **Local-only storage** (no cloud dependencies)
- **Rate limiting** and input validation on all endpoints

### Admin Controls
- Emergency data deletion with confirmation password
- Vote reset capabilities for demo purposes
- Database statistics and management tools

## Development Notes

### Port Configuration
- **Backend API**: 3000
- **Frontend**: 5173 (Vite dev server)
- **Blockchain**: 8545 (Hardhat local node)

### Environment Setup
- Requires **Node.js v16+** and modern browser with WebAuthn support
- **Windows Hello** integration for real fingerprint capture (optional)
- Falls back to fingerprint simulation when hardware unavailable

### File Structure Patterns
- Backend logic in root directory (`server.js`, `database.js`)
- Frontend React app in `frontend/src/components/`
- Smart contracts in `contracts/`
- Deployment scripts in `scripts/`

### Testing Strategy
- Use **start-system.ps1** for full system startup
- Test individual API endpoints with curl or Postman
- Frontend components accessible via direct URL navigation
- Contract testing via Hardhat test suite

### Demo Limitations
- **Educational purpose only** - not production-ready
- Simplified encryption (demo-grade, not cryptographically secure)
- Local database only (no synchronization across devices)
- Admin controls exposed for demonstration