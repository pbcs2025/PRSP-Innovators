const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login to http://localhost:5000/auth/login');
    const response = await axios.post('http://localhost:5000/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
      console.error('Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
