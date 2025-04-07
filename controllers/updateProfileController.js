const User = require("../models/User");

module.exports = async (req, res) => {
    try {
        console.log("User ID:", req.session.user._id);
        const { username, email, gender } = req.body;
        console.log("Received Data:", { username, email, gender });

        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!username || !email || !gender) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.user._id,
            { username, email, gender },
            { new: true }
        );

        console.log("Updated User:", updatedUser);

        res.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};