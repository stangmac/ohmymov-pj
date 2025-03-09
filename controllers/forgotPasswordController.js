require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendOTP = require('../services/mailService');

module.exports = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('forgot-password', { error: "Email not found!" });
        }

        // ✅ สร้าง OTP แบบ 6 หลักแทน JWT
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 

        // ✅ บันทึก OTP ลง Database
        user.resetToken = otp;
        user.resetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 นาที
        await user.save();

        console.log(`OTP Saved in DB: ${user.resetToken}`);
        console.log(`Expiration Time: ${new Date(user.resetTokenExpires)}`);

        // ✅ ส่งอีเมล OTP
        await sendOTP(email, otp);

        res.render('verify-otp', { email, error: null });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing request");
    }
};
