const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'aadhaar_demo.db');
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to the SQLite database.');
                this.initializeTables();
            }
        });
    }

    initializeTables() {
        // Users table for storing basic user information
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                unique_number TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                location TEXT NOT NULL,
                phone_number TEXT,
                email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Fingerprint data table for storing encrypted fingerprint templates
        const createFingerprintTable = `
            CREATE TABLE IF NOT EXISTS fingerprints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                fingerprint_hash TEXT NOT NULL,
                fingerprint_template TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `;

        // Voting status table for tracking who has voted (without storing vote choice)
        const createVotingStatusTable = `
            CREATE TABLE IF NOT EXISTS voting_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                has_voted BOOLEAN DEFAULT 0,
                voted_at DATETIME,
                transaction_hash TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `;

        // Votes table for storing vote details for receipt verification
        const createVotesTable = `
            CREATE TABLE IF NOT EXISTS votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                candidateId INTEGER NOT NULL,
                candidateName TEXT NOT NULL,
                candidateParty TEXT,
                transactionHash TEXT UNIQUE NOT NULL,
                blockNumber INTEGER,
                votedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id)
            )
        `;  

        this.db.run(createUsersTable, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table created or already exists.');
            }
        });

        this.db.run(createFingerprintTable, (err) => {
            if (err) {
                console.error('Error creating fingerprints table:', err.message);
            } else {
                console.log('Fingerprints table created or already exists.');
            }
        });
        this.db.run(createVotingStatusTable, (err) => {
            if (err) {
                console.error('Error creating voting_status table:', err.message);
            } else {
                console.log('Voting status table created or already exists.');
            }
        });

        this.db.run(createVotesTable, (err) => {
            if (err) {
                console.error('Error creating votes table:', err.message);
            } else {
                console.log('Votes table created or already exists.');
            }
        });
    }

    // Register a new user
    registerUser(userData, callback) {
        const { uniqueNumber, name, age, gender, location, phoneNumber, email } = userData;
        
        // Generate a unique ID if not provided
        const finalUniqueNumber = uniqueNumber || this.generateUniqueNumber();
        
        const query = `
            INSERT INTO users (unique_number, name, age, gender, location, phone_number, email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        this.db.run(query, [finalUniqueNumber, name, age, gender, location, phoneNumber, email], function(err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, { 
                    userId: this.lastID, 
                    uniqueNumber: finalUniqueNumber 
                });
            }
        });
    }

    // Store fingerprint data
    storeFingerprintData(userId, fingerprintData, callback) {
        // Create a hash of the fingerprint for quick matching
        const fingerprintHash = crypto.createHash('sha256').update(fingerprintData).digest('hex');
        
        // Encrypt the actual fingerprint template
        const encryptedTemplate = this.encryptData(fingerprintData);

        const query = `
            INSERT INTO fingerprints (user_id, fingerprint_hash, fingerprint_template)
            VALUES (?, ?, ?)
        `;

        this.db.run(query, [userId, fingerprintHash, encryptedTemplate], function(err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, { fingerprintId: this.lastID });
            }
        });
    }

    // Verify fingerprint and get user data
    verifyFingerprint(fingerprintData, callback) {
        const fingerprintHash = crypto.createHash('sha256').update(fingerprintData).digest('hex');
        
        const query = `
            SELECT u.*, f.id as fingerprint_id
            FROM users u
            INNER JOIN fingerprints f ON u.id = f.user_id
            WHERE f.fingerprint_hash = ?
        `;

        this.db.get(query, [fingerprintHash], (err, row) => {
            if (err) {
                callback(err, null);
            } else if (row) {
                callback(null, {
                    verified: true,
                    user: {
                        id: row.id,
                        uniqueNumber: row.unique_number,
                        name: row.name,
                        age: row.age,
                        gender: row.gender,
                        location: row.location,
                        phoneNumber: row.phone_number,
                        email: row.email,
                        createdAt: row.created_at
                    }
                });
            } else {
                callback(null, { verified: false, user: null });
            }
        });
    }

    // Get user by unique number
    getUserByUniqueNumber(uniqueNumber, callback) {
        const query = `SELECT * FROM users WHERE unique_number = ?`;
        
        this.db.get(query, [uniqueNumber], (err, row) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, row);
            }
        });
    }

    // Check if user has already voted
    checkVotingStatus(userId, callback) {
        const query = `SELECT * FROM voting_status WHERE user_id = ?`;
        
        this.db.get(query, [userId], (err, row) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, {
                    hasVoted: row ? Boolean(row.has_voted) : false,
                    votedAt: row ? row.voted_at : null,
                    transactionHash: row ? row.transaction_hash : null
                });
            }
        });
    }

    // Mark user as voted
    markUserAsVoted(userId, transactionHash, callback) {
        const query = `
            INSERT OR REPLACE INTO voting_status (user_id, has_voted, voted_at, transaction_hash)
            VALUES (?, 1, datetime('now'), ?)
        `;
        
        this.db.run(query, [userId, transactionHash], function(err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, { success: true });
            }
        });
    }

    // Store vote details for receipt verification
    storeVoteDetails(voteData, callback) {
        const { userId, candidateId, candidateName, candidateParty, transactionHash, blockNumber } = voteData;
        
        const query = `
            INSERT INTO votes (userId, candidateId, candidateName, candidateParty, transactionHash, blockNumber, votedAt)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `;
        
        this.db.run(query, [userId, candidateId, candidateName, candidateParty, transactionHash, blockNumber], function(err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, { voteId: this.lastID });
            }
        });
    }

    // Generate a unique Aadhaar-like number
    generateUniqueNumber() {
        // Generate a 12-digit unique number similar to Aadhaar
        return Math.floor(100000000000 + Math.random() * 900000000000).toString();
    }

    // Encrypt sensitive data
    encryptData(data) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync('your-secret-key', 'salt', 32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted;
    }

    // Decrypt sensitive data
    decryptData(encryptedData) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync('your-secret-key', 'salt', 32);
        
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    // Close database connection
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

module.exports = Database;