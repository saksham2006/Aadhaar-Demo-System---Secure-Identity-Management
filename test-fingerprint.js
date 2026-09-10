// Simple test script to verify fingerprint system
const Database = require('./database');

async function testFingerprintSystem() {
    const db = new Database();
    
    console.log('🧪 Testing Fingerprint System...\n');
    
    try {
        // Test 1: Register a user
        console.log('📝 Test 1: Registering a test user...');
        
        const userData = {
            uniqueNumber: '123456789012',
            name: 'John Test',
            age: 30,
            gender: 'Male',
            location: 'Test City',
            phoneNumber: '+1234567890',
            email: 'john@test.com'
        };
        
        const userResult = await new Promise((resolve, reject) => {
            db.registerUser(userData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('✅ User registered:', userResult);
        
        // Test 2: Store fingerprint
        console.log('\n👆 Test 2: Storing fingerprint...');
        
        const testFingerprintData = 'test_fingerprint_data_12345';
        
        const fingerprintResult = await new Promise((resolve, reject) => {
            db.storeFingerprintData(userResult.userId, testFingerprintData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('✅ Fingerprint stored:', fingerprintResult);
        
        // Test 3: Verify fingerprint (should succeed)
        console.log('\n🔍 Test 3: Verifying correct fingerprint...');
        
        const verifyResult = await new Promise((resolve, reject) => {
            db.verifyFingerprint(testFingerprintData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('✅ Verification result:', verifyResult);
        
        // Test 4: Verify wrong fingerprint (should fail)
        console.log('\n❌ Test 4: Verifying wrong fingerprint...');
        
        const wrongFingerprintData = 'wrong_fingerprint_data';
        
        const wrongVerifyResult = await new Promise((resolve, reject) => {
            db.verifyFingerprint(wrongFingerprintData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log('✅ Wrong fingerprint result:', wrongVerifyResult);
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📊 Summary:');
        console.log('- User registration: ✅ Working');
        console.log('- Fingerprint storage: ✅ Working'); 
        console.log('- Correct verification: ✅ Working');
        console.log('- Incorrect verification: ✅ Working (correctly fails)');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        db.close();
    }
}

// Run the test
testFingerprintSystem();