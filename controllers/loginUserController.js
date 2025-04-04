const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router(); // ✅ เพิ่มบรรทัดนี้เพื่อกำหนด router

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
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.render('login', {
                error: { username: { msg: "Invalid username or password." } }
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.render('login', {
                error: { password: { msg: "Invalid username or password." } }
            });
        }

        user.lastLogin = new Date();
        await user.save();
        req.session.user = { 
            _id: user._id.toString(), // ✅ ใช้ `_id` ให้ตรงกับ MongoDB
            email: user.email,
            username: user.username 
        };

await req.session.save();
console.log("User logged in:", req.session.user);


        return res.redirect('/');
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router; // ✅ อย่าลืม export router ออกไปใช้ใน index.js
