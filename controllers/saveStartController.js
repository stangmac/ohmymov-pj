const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const selectedGenres = JSON.parse(req.body.selectedGenres);
        if (!req.session.userId) {
            return res.status(401).send("Not authenticated");
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        user.favoriteGenres = selectedGenres; // เพิ่มฟิลด์นี้ใน schema ด้านล่าง
        await user.save();

        res.redirect('/suggestion');
    } catch (err) {
        res.status(500).send("Error saving genres: " + err.message);
    }
};
