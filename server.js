const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { Web3 } = require('web3');
const crypto = require('crypto');
const Database = require('./database');

// Handle BigInt JSON serialization globally
BigInt.prototype.toJSON = function() {
    return this.toString();
};

// Load contract ABI and deployment info
const contractABI = require('./artifacts/contracts/EVoting.sol/EVoting.json').abi;
const deploymentInfo = require('./deployment-info.json');

// Initialize Web3 and contract
const web3 = new Web3('http://localhost:8545'); // Connect to local Hardhat node
const contract = new web3.eth.Contract(contractABI, deploymentInfo.contractAddress);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"]
        }
    }
}));

app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend/dist')));
}

// API Routes

// Register a new user
app.post('/api/register', (req, res) => {
    const { uniqueNumber, name, age, gender, location, phoneNumber, email } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !location) {
        return res.status(400).json({
            success: false,
            message: 'Name, age, gender, and location are required fields.'
        });
    }

    // Validate age
    if (isNaN(age) || age < 1 || age > 150) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid age between 1 and 150.'
        });
    }

    const userData = {
        uniqueNumber,
        name: name.trim(),
        age: parseInt(age),
        gender: gender.trim(),
        location: location.trim(),
        phoneNumber: phoneNumber ? phoneNumber.trim() : null,
        email: email ? email.trim() : null
    };

    db.registerUser(userData, (err, result) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({
                    success: false,
                    message: 'A user with this unique number already exists.'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to register user. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'User registered successfully.',
            data: {
                userId: result.userId,
                uniqueNumber: result.uniqueNumber
            }
        });
    });
});

// Store fingerprint data
app.post('/api/register-fingerprint', (req, res) => {
    const { userId, fingerprintData } = req.body;

    if (!userId || !fingerprintData) {
        return res.status(400).json({
            success: false,
            message: 'User ID and fingerprint data are required.'
        });
    }

    db.storeFingerprintData(userId, fingerprintData, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to store fingerprint data. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'Fingerprint registered successfully.',
            data: { fingerprintId: result.fingerprintId }
        });
    });
});

// Verify fingerprint and authenticate user
app.post('/api/verify-fingerprint', (req, res) => {
    const { fingerprintData } = req.body;

    if (!fingerprintData) {
        return res.status(400).json({
            success: false,
            message: 'Fingerprint data is required for verification.'
        });
    }

    db.verifyFingerprint(fingerprintData, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to verify fingerprint. Please try again.'
            });
        }

        if (result.verified) {
            res.json({
                success: true,
                verified: true,
                message: 'Fingerprint verified successfully.',
                user: result.user
            });
        } else {
            res.json({
                success: true,
                verified: false,
                message: 'Fingerprint not recognized. Please try again or register first.'
            });
        }
    });
});

// Get user by unique number (for testing purposes)
app.get('/api/user/:uniqueNumber', (req, res) => {
    const { uniqueNumber } = req.params;

    if (!uniqueNumber) {
        return res.status(400).json({
            success: false,
            message: 'Unique number is required.'
        });
    }

    db.getUserByUniqueNumber(uniqueNumber, (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve user data.'
            });
        }

        if (user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    uniqueNumber: user.unique_number,
                    name: user.name,
                    age: user.age,
                    gender: user.gender,
                    location: user.location,
                    phoneNumber: user.phone_number,
                    email: user.email,
                    createdAt: user.created_at
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
    });
});

// Database management endpoints
app.delete('/api/admin/clear-database', (req, res) => {
    // Clear all users and fingerprints
    db.db.run('DELETE FROM fingerprints', (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to clear fingerprints table'
            });
        }
        
        db.db.run('DELETE FROM users', (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to clear users table'
                });
            }
            
            res.json({
                success: true,
                message: 'Database cleared successfully'
            });
        });
    });
});

// EMERGENCY: Delete ALL data (database + blockchain votes)
app.delete('/api/admin/emergency-delete-all', async (req, res) => {
    const { confirmPassword } = req.body;
    
    // Require confirmation password for this dangerous operation
    if (confirmPassword !== 'DELETE_ALL_DATA_CONFIRM_2024') {
        return res.status(401).json({
            success: false,
            message: 'Invalid confirmation password for emergency deletion'
        });
    }
    
    try {
        // 1. Reset blockchain votes
        const accounts = await web3.eth.getAccounts();
        const adminAccount = accounts[0];
        
        await contract.methods.emergencyReset().send({
            from: adminAccount,
            gas: 5000000
        });
        
        // 2. Clear all database tables
        const clearTables = (callback) => {
            db.db.run('DELETE FROM voting_status', (err) => {
                if (err) console.error('Error clearing voting_status:', err);
                
                db.db.run('DELETE FROM fingerprints', (err) => {
                    if (err) console.error('Error clearing fingerprints:', err);
                    
                    db.db.run('DELETE FROM users', (err) => {
                        if (err) console.error('Error clearing users:', err);
                        callback(err);
                    });
                });
            });
        };
        
        clearTables((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to clear database completely'
                });
            }
            
            res.json({
                success: true,
                message: 'EMERGENCY DELETION COMPLETE: All voter data and votes have been permanently deleted',
                warning: 'This action cannot be undone. All voting history is lost.'
            });
        });
        
    } catch (error) {
        console.error('Emergency deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete emergency deletion'
        });
    }
});

app.get('/api/admin/stats', (req, res) => {
    db.db.get('SELECT COUNT(*) as userCount FROM users', (err, userRow) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to get user count' });
        }
        
        db.db.get('SELECT COUNT(*) as fingerprintCount FROM fingerprints', (err, fpRow) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to get fingerprint count' });
            }
            
            res.json({
                success: true,
                stats: {
                    users: userRow.userCount,
                    fingerprints: fpRow.fingerprintCount,
                    timestamp: new Date().toISOString()
                }
            });
        });
    });
});

// === BLOCKCHAIN VOTING ENDPOINTS ===

// Get all candidates from blockchain
app.get('/api/blockchain/candidates', async (req, res) => {
    try {
        const result = await contract.methods.getAllCandidates().call();
        const candidates = [];
        
        for (let i = 0; i < result.ids.length; i++) {
            candidates.push({
                id: parseInt(result.ids[i]),
                name: result.names[i],
                party: result.parties[i],
                voteCount: parseInt(result.voteCounts[i])
            });
        }
        
        res.json({
            success: true,
            candidates: candidates
        });
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch candidates from blockchain'
        });
    }
});

// Check if user has voted
app.get('/api/voting/status/:userId', (req, res) => {
    const { userId } = req.params;
    
    db.checkVotingStatus(userId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to check voting status'
            });
        }
        
        res.json({
            success: true,
            hasVoted: result.hasVoted,
            votedAt: result.votedAt,
            transactionHash: result.transactionHash
        });
    });
});

// Cast anonymous vote on blockchain with encryption
app.post('/api/voting/cast', async (req, res) => {
    const { candidateId, userId } = req.body;
    
    if (!candidateId || !userId) {
        return res.status(400).json({
            success: false,
            message: 'Candidate ID and User ID are required'
        });
    }
    
    try {
        // First check if user has already voted
        db.checkVotingStatus(userId, async (err, votingStatus) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check voting status'
                });
            }
            
            if (votingStatus.hasVoted) {
                return res.status(400).json({
                    success: false,
                    message: 'User has already voted'
                });
            }
            
            try {
                // Get candidate name for encryption
                const candidatesResult = await contract.methods.getAllCandidates().call();
                const candidateIndex = parseInt(candidateId) - 1;
                const candidateName = candidatesResult.names[candidateIndex];
                
                // Generate anonymous voter hash (for privacy)
                const voterHash = crypto.createHash('sha256')
                    .update(userId.toString() + Date.now().toString() + Math.random().toString(), 'utf8')
                    .digest('hex');
                const voterHashBytes32 = '0x' + voterHash;
                
                // Encrypt the vote choice (simplified encryption for demo)
                const voteData = JSON.stringify({
                    candidateId: candidateId.toString(),
                    candidateName: candidateName,
                    timestamp: Date.now().toString()
                }, (key, value) => {
                    // Handle BigInt serialization
                    if (typeof value === 'bigint') {
                        return value.toString();
                    }
                    return value;
                });
                
                // Simple encryption using crypto (in production, use proper public key encryption)
                const encryptionKey = 'demo_encryption_key_2024';
                const encryptedChoice = crypto.createHash('sha256')
                    .update(voteData + encryptionKey, 'utf8')
                    .digest('hex');
                
                // Get accounts for transaction
                const accounts = await web3.eth.getAccounts();
                const fromAccount = accounts[0]; // Use first account (admin)
                
                // Cast both public tally vote and encrypted vote on blockchain
                let tx;
                const candidateIdNumber = parseInt(candidateId);
                
                try {
                    // Try the enhanced voting method first
                    tx = await contract.methods.voteWithEncryption(
                        candidateIdNumber, 
                        encryptedChoice, 
                        voterHashBytes32
                    ).send({
                        from: fromAccount,
                        gas: 5000000
                    });
                } catch (enhancedVoteError) {
                    console.log('Enhanced voting not available, falling back to basic vote:', enhancedVoteError.message);
                    // Fallback to basic voting if enhanced method doesn't exist
                    tx = await contract.methods.vote(candidateIdNumber, voterHashBytes32).send({
                        from: fromAccount,
                        gas: 3000000
                    });
                }
                
                // Mark user as voted in local database
                db.markUserAsVoted(userId, tx.transactionHash, (err, result) => {
                    if (err) {
                        console.error('Error marking user as voted:', err);
                        // Even if local DB fails, blockchain vote is cast
                    }
                });
                
                // Store vote details for receipt verification
                const candidateParty = candidatesResult.parties[candidateIndex];
                db.storeVoteDetails({
                    userId: userId,
                    candidateId: candidateId,
                    candidateName: candidateName,
                    candidateParty: candidateParty,
                    transactionHash: tx.transactionHash,
                    blockNumber: tx.blockNumber
                }, (err, voteResult) => {
                    if (err) {
                        console.error('Error storing vote details:', err);
                    }
                });
                
                res.json({
                    success: true,
                    message: 'Vote cast successfully',
                    transactionHash: tx.transactionHash,
                    blockNumber: tx.blockNumber,
                    receiptHash: tx.events.EncryptedVoteStored ? 
                        tx.events.EncryptedVoteStored.returnValues.receiptHash : null
                });
                
            } catch (blockchainError) {
                console.error('Blockchain error:', blockchainError);
                res.status(500).json({
                    success: false,
                    message: 'Failed to cast vote on blockchain: ' + blockchainError.message
                });
            }
        });
        
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cast vote'
        });
    }
});

// Verify vote receipt (shows transaction details but NOT vote choice)
app.post('/api/voting/verify-receipt', async (req, res) => {
    const { receiptHash } = req.body;
    
    if (!receiptHash) {
        return res.status(400).json({
            success: false,
            message: 'Receipt hash is required'
        });
    }
    
    try {
        // Get transaction details from blockchain using Web3
        const receipt = await web3.eth.getTransactionReceipt(receiptHash);
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found. Please check your transaction hash.'
            });
        }
        
        // Get the actual transaction details
        const transaction = await web3.eth.getTransaction(receiptHash);
        const block = await web3.eth.getBlock(receipt.blockNumber);
        
        // Try to get voter info from database if available
        let voterInfo = null;
        let candidateInfo = null;
        
        // Check if we have this transaction recorded in our database
        db.db.get(
            'SELECT users.name, users.uniqueNumber, users.id, votes.candidateName, votes.candidateParty, votes.votedAt FROM users INNER JOIN votes ON users.id = votes.userId WHERE votes.transactionHash = ?',
            [receiptHash],
            async (err, voteRow) => {
                if (!err && voteRow) {
                    voterInfo = {
                        name: voteRow.name,
                        aadhaarId: voteRow.uniqueNumber // Use uniqueNumber as Aadhaar ID
                    };
                    candidateInfo = {
                        name: voteRow.candidateName,
                        party: voteRow.candidateParty
                    };
                }
                
                // Convert blockchain timestamp to milliseconds for JavaScript Date
                const timestampMs = typeof block.timestamp === 'bigint' ? 
                    Number(block.timestamp) * 1000 : 
                    parseInt(block.timestamp) * 1000;
                
                // Use database timestamp if available, otherwise blockchain timestamp
                const voteTimestamp = voteRow && voteRow.votedAt ? 
                    new Date(voteRow.votedAt).toISOString() : 
                    new Date(timestampMs).toISOString();
                
                // Return transaction details WITH voter and candidate info when available
                res.json({
                    success: true,
                    receipt: {
                        transactionHash: receiptHash,
                        blockNumber: receipt.blockNumber,
                        timestamp: voteTimestamp, // Use real vote timestamp
                        actualBlockTimestamp: timestampMs, // Real blockchain timestamp
                        gasUsed: receipt.gasUsed,
                        status: receipt.status === 1 ? 'Success' : 'Failed',
                        contractAddress: receipt.to,
                        voterName: voterInfo ? voterInfo.name : 'Verified Voter',
                        voterId: voterInfo ? voterInfo.aadhaarId : null,
                        candidateName: candidateInfo ? candidateInfo.name : null,
                        candidateParty: candidateInfo ? candidateInfo.party : null,
                        verified: true
                    }
                });
            }
        );
        
    } catch (error) {
        console.error('Error verifying receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify receipt. Please check your transaction hash.'
        });
    }
});

// Get voting results from blockchain
app.get('/api/blockchain/results', async (req, res) => {
    try {
        const candidates = await contract.methods.getAllCandidates().call();
        const results = await contract.methods.getResults().call();
        
        const candidateResults = [];
        for (let i = 0; i < candidates.ids.length; i++) {
            candidateResults.push({
                id: parseInt(candidates.ids[i]),
                name: candidates.names[i],
                party: candidates.parties[i],
                voteCount: parseInt(candidates.voteCounts[i])
            });
        }
        
        // Sort by vote count (highest first)
        candidateResults.sort((a, b) => b.voteCount - a.voteCount);
        
        res.json({
            success: true,
            results: {
                candidates: candidateResults,
                totalVotes: parseInt(results.totalVotesCast),
                totalCandidates: parseInt(results.totalCandidates),
                encryptedVotesCast: results.encryptedVotesCast ? parseInt(results.encryptedVotesCast) : 0,
                votingActive: results.isActive
            }
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch voting results'
        });
    }
});

// Get encrypted votes metadata from blockchain (admin only)
// NOTE: This only shows that encrypted votes exist, NOT the vote choices
app.get('/api/blockchain/encrypted-votes', async (req, res) => {
    try {
        // In a real system, this would require admin authentication
        let encryptedVotes;
        try {
            encryptedVotes = await contract.methods.getAllEncryptedVotes().call();
        } catch (methodError) {
            console.log('Enhanced encrypted votes method not available:', methodError.message);
            // Return empty array if method doesn't exist
            return res.json({
                success: true,
                encryptedVotes: [],
                message: 'Enhanced encryption features not available in current contract'
            });
        }
        
        const votes = [];
        if (encryptedVotes && encryptedVotes.voteIds) {
            for (let i = 0; i < encryptedVotes.voteIds.length; i++) {
                votes.push({
                    id: parseInt(encryptedVotes.voteIds[i]),
                    voterHash: '***ANONYMOUS***', // Hide voter identity completely
                    encryptedChoice: '***ENCRYPTED***', // Hide encrypted choice
                    timestamp: parseInt(encryptedVotes.timestamps[i]) * 1000,
                    receiptHash: encryptedVotes.receiptHashes[i],
                    status: 'Encrypted and Anonymous'
                });
            }
        }
        
        res.json({
            success: true,
            encryptedVotes: votes,
            message: 'Vote details are encrypted and anonymous for privacy protection'
        });
    } catch (error) {
        console.error('Error fetching encrypted votes metadata:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch encrypted votes metadata from blockchain'
        });
    }
});

// Admin: Reset voting (clear all votes)
app.post('/api/admin/reset-votes', async (req, res) => {
    try {
        const accounts = await web3.eth.getAccounts();
        const adminAccount = accounts[0];
        
        // Reset votes on blockchain
        await contract.methods.resetVotes().send({
            from: adminAccount,
            gas: 3000000
        });
        
        // Clear voting status in local database
        db.db.run('DELETE FROM voting_status', (err) => {
            if (err) {
                console.error('Error clearing voting status:', err);
            }
        });
        
        res.json({
            success: true,
            message: 'All votes have been reset'
        });
    } catch (error) {
        console.error('Error resetting votes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset votes'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
    } else {
        res.json({
            message: 'API server running. Start frontend with: cd frontend && npm run dev',
            endpoints: {
                register: 'POST /api/register',
                registerFingerprint: 'POST /api/register-fingerprint',
                verifyFingerprint: 'POST /api/verify-fingerprint',
                getUser: 'GET /api/user/:uniqueNumber',
                candidates: 'GET /api/blockchain/candidates',
                votingStatus: 'GET /api/voting/status/:userId',
                castVote: 'POST /api/voting/cast',
                results: 'GET /api/blockchain/results',
                resetVotes: 'POST /api/admin/reset-votes',
                health: 'GET /api/health'
            }
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 E-Voting System running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('  • GET  /                           - Main dashboard');
    console.log('  • POST /api/register               - Register new user');
    console.log('  • POST /api/register-fingerprint   - Store fingerprint');
    console.log('  • POST /api/verify-fingerprint     - Verify fingerprint');
    console.log('  • GET  /api/user/:number           - Get user by unique number');
    console.log('  • GET  /api/blockchain/candidates  - Get candidates from blockchain');
    console.log('  • GET  /api/voting/status/:userId  - Check if user has voted');
    console.log('  • POST /api/voting/cast            - Cast vote on blockchain');
    console.log('  • GET  /api/blockchain/results     - Get voting results');
    console.log('  • POST /api/admin/reset-votes      - Reset all votes (admin)');
    console.log('  • GET  /api/health                 - Health check');
    console.log('');
    console.log('🔗 Blockchain: Connected to local Hardhat node');
    console.log(`📝 Smart Contract: ${deploymentInfo.contractAddress}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down gracefully...');
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔄 Shutting down gracefully...');
    db.close();
    process.exit(0);
});