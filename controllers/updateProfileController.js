const User = require("../models/User");

module.exports = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { username, email, gender } = req.body;

        if (!username || !email || !gender) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        await User.findByIdAndUpdate(req.session.user.id, { username, email, gender });

        res.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
