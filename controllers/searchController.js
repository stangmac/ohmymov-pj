const UserSearch = require("../models/UserSearch");

module.exports = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query || query.length < 2) {
            return res.json([]);
        }

        const movies = await Movie.find({ title: { $regex: query, $options: "i" } });

        if (req.session.user) {
            await UserSearch.create({
                userId: req.session.user._id,
                searchQuery: query
            });
        }

        res.json(movies);
    } catch (err) {
        console.error("Error fetching search results:", err);
        res.status(500).json({ error: "Error fetching search results" });
    }
};
