require('dotenv').config();
const sendOTP = require('./services/mailService'); // ✅ แก้ path ให้ถูกต้อง

sendOTP('your-test-email@example.com', '123456')
    .then(() => console.log('✅ OTP Sent!'))
    .catch((err) => console.error('❌ Error:', err));
