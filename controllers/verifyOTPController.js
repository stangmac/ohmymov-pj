const User = require('../models/User');

module.exports = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('verify-otp', { email, error: "Invalid or expired OTP!" });
        }

        console.log(`Stored OTP in DB: ${user.resetToken}`);
        console.log(`User Entered OTP: ${otp}`);
        console.log(`Expiration Time: ${new Date(user.resetTokenExpires)}`);
        console.log(`Current Time: ${new Date()}`);

        // ✅ แปลงค่าเป็น String เพื่อเปรียบเทียบ
        if (user.resetToken !== otp.toString()) {
            return res.render('verify-otp', { email, error: "Invalid OTP!" });
        }

        // ✅ ตรวจสอบว่า OTP หมดอายุหรือยัง
        if (Date.now() > user.resetTokenExpires) {
            return res.render('verify-otp', { email, error: "OTP has expired!" });
        }

        // ✅ ล้างค่า OTP หลังจากใช้งานแล้ว
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.render('reset-password', { email, error: null });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error verifying OTP");
    }
};
