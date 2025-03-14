const Movie = require('../models/Movies');

module.exports = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query || query.length < 2) {
            return res.json([]); // ถ้าคีย์เวิร์ดสั้นเกินไปให้ส่งค่า [] กลับไป
        }

        const movies = await Movie.find({ title: { $regex: query, $options: "i" } });
        console.log("Search Results:", movies); // ✅ Debug ดูว่าผลลัพธ์เป็นอะไร

        res.json(movies);
    } catch (err) {
        console.error("Error fetching search results:", err);
        res.status(500).json({ error: "Error fetching search results" });
    }
};
