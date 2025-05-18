
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post('/register', [
    body('email')
        .isEmail().withMessage('Please enter a valid email')
        .custom(async (value) => {
            const existingUser = await User.findOne({ email: value });
            if (existingUser) {
                throw new Error('Email is already in use');
            }
            return true;
        }),
    body('username')
        .notEmpty().withMessage('Please enter a valid username')
        .custom(async (value) => {
            const existingUser = await User.findOne({ username: value });
            if (existingUser) {
                throw new Error('Username is already in use');
            }
            return true;
        }),
    body('dateOfBirth').notEmpty().withMessage('Date of Birth is required'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirm_password')
        .notEmpty().withMessage('Confirm Password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    body('agreeTerms')
        .equals('on').withMessage('You must agree to the Terms of Service and Privacy Policy')
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('register', {
            error: errors.mapped(),
            email: req.body.email,
            username: req.body.username,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            password: req.body.password,
            confirmPassword: req.body.confirm_password
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            email: req.body.email,
            username: req.body.username,
            date: req.body.dateOfBirth,
            gender: req.body.gender,
            password: hashedPassword
        });

        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send("Error saving user: " + err.message);
    }
});

module.exports = router;




   