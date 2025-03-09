const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
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
        const user = await User.findOne({ username });

        if (!user) {
            console.log("❌ User not found:", username);
            return res.render('login', {
                error: { username: { msg: "Invalid username or password." } }
            });
        }

        console.log("✅ User found:", user);

        console.log("🔍 Checking password...");
        console.log("Input Password:", password);
        console.log("Stored Hashed Password:", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log("❌ Password mismatch for user:", username);
            return res.render('login', {
                error: { password: { msg: "Invalid username or password." } }
            });
        }

        console.log("✅ Password matched!");

        user.lastLogin = new Date();
        await user.save();

        req.session.userID = user._id;
        req.session.username = user.username;
        res.locals.loggedIN = user.username; // ✅ อัปเดตค่า
        

        console.log("🎉 Login successful:", username);
        return res.redirect('/');
    } catch (error) {
        console.error("🚨 Login error:", error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
