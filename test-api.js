// Test script to verify API endpoints
// Run this after starting the server with: node test-api.js

const testAPI = async () => {
    const baseURL = 'http://localhost:3000';

    console.log('🧪 Testing Gridify API...\n');

    // Test 1: Register a new user
    console.log('1️⃣  Testing Registration...');
    try {
        const registerResponse = await fetch(`${baseURL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        const registerData = await registerResponse.json();
        console.log('✅ Registration:', registerData.success ? 'SUCCESS' : 'FAILED');
        console.log('   Message:', registerData.message);
        console.log('   User:', registerData.user);
    } catch (error) {
        console.log('❌ Registration failed:', error.message);
    }

    console.log('\n');

    // Test 2: Login with existing user
    console.log('2️⃣  Testing Login...');
    try {
        const loginResponse = await fetch(`${baseURL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        const loginData = await loginResponse.json();
        console.log('✅ Login:', loginData.success ? 'SUCCESS' : 'FAILED');
        console.log('   Message:', loginData.message);
        if (loginData.user) {
            console.log('   User:', loginData.user);
        }
    } catch (error) {
        console.log('❌ Login failed:', error.message);
    }

    console.log('\n');

    // Test 3: Get all users
    console.log('3️⃣  Testing Get All Users...');
    try {
        const usersResponse = await fetch(`${baseURL}/api/users`);
        const usersData = await usersResponse.json();
        console.log('✅ Get Users:', usersData.success ? 'SUCCESS' : 'FAILED');
        console.log('   Total users:', usersData.users?.length || 0);
        if (usersData.users && usersData.users.length > 0) {
            console.log('   First user:', usersData.users[0]);
        }
    } catch (error) {
        console.log('❌ Get users failed:', error.message);
    }

    console.log('\n✨ Testing complete!\n');
};

// Run tests
testAPI().catch(console.error);
