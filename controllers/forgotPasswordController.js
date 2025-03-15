require("dotenv").config();
const User = require("../models/User");
const sendEmail = require("../services/mailService");

module.exports = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.render("forgot-password", { error: "Email is required!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render("forgot-password", { error: "Email not found!" });
        }

        // ✅ สร้าง OTP 6 หลัก
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // ✅ บันทึก OTP ลง Database และตั้งเวลาหมดอายุ 10 นาที
        user.resetToken = otp;
        user.resetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 นาที
        await user.save();

        console.log(`OTP Saved in DB: ${otp}`);

        // ✅ ส่งอีเมล OTP
        await sendEmail(email, otp);

        res.render("verify-otp", { email, error: null });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing request");
    }
};
