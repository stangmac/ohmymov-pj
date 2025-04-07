const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// POST /login - เข้าสู่ระบบ
router.post('/login', [
    body('username').notEmpty().withMessage('Username or Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.mapped(),
            username: req.body.username
        });
    }

    const { username, password } = req.body;

    try {
        // ค้นหาผู้ใช้จาก username หรือ email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.render('login', {
                error: { username: { msg: "Invalid username or password." } }
            });
        }

        // เปรียบเทียบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', {
                error: { password: { msg: "Invalid username or password." } }
            });
        }

        // อัปเดตเวลาล็อกอินล่าสุด
        user.lastLogin = new Date();
        await user.save();

        // สร้าง session
        req.session.user = {
            _id: user._id.toString(), // แปลง ObjectId เป็น string สำหรับ session
            email: user.email,
            username: user.username
        };

        await req.session.save(); // ให้แน่ใจว่า session บันทึกก่อน redirect
        console.log("✅ User logged in:", req.session.user);

        return res.redirect('/');
    } catch (error) {
        console.error("❌ Error during login:", error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
