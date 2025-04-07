const User = require("../models/User");
const bcrypt = require("bcrypt");
const sendEmail = require("../services/mailService");

// ✅ ฟังก์ชันขอ OTP
module.exports.requestOtp = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await User.findById(req.session.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetToken = otp;
        user.resetTokenExpires = Date.now() + 10 * 60 * 1000; // OTP มีอายุ 10 นาที
        await user.save();

        console.log(`Generated OTP for ${user.email}: ${otp}`);

        await sendEmail(user.email, otp);

        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Error sending OTP" });
    }
};

// ✅ ฟังก์ชันเปลี่ยนรหัสผ่าน
module.exports.changePassword = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { newPassword, otpCode } = req.body;
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.resetToken || user.resetTokenExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        if (user.resetToken !== otpCode) {
            return res.status(400).json({ success: false, message: "Incorrect OTP" });
        }

        // ✅ แฮชรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // ✅ ล้างค่า OTP หลังจากเปลี่ยนรหัสผ่านสำเร็จ
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        res.json({ success: true, message: "Password changed successfully!" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ success: false, message: "Error changing password" });
    }
};