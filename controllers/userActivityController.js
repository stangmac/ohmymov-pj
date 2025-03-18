const UserActivity = require("../models/UserActivity");

async function logUserActivity(req, res) {
    try {
        if (!req.session.user) {
            console.error("Error: User not logged in");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = req.session.user._id || req.session.user.id;
        const { movieId, action } = req.body;

        if (!movieId || !action) {
            console.error("Error: Missing movieId or action", req.body);
            return res.status(400).json({ error: "Missing movieId or action" });
        }

        console.log("Logging Activity:", { userId, movieId, action });

        await UserActivity.create({ userId, movieId, action });

        return res.status(200).json({ message: "Activity logged successfully" });
    } catch (error) {
        console.error("Error logging activity:", error);
        return res.status(500).json({ error: "Internal Server Error can not use" });
    }
}

module.exports = { logUserActivity };
