const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('reset-password', { email, error: "Passwords do not match!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword, resetToken: null, resetTokenExpires: null }
        );

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error resetting password");
    }
};
