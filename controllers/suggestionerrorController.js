const Movie = require('../models/Movies');

module.exports = async (req, res) => {
    try {
        // 🔄 ดึงหนังล่าสุดจำนวน 10 เรื่อง (หรือแล้วแต่ที่ต้องการ)
        const latestMovies = await Movie.find({
            poster_url: { $exists: true, $ne: [] }
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

        res.render('suggestionerror', {
            latestMovies
        });

    } catch (err) {
        console.error('❌ Error in suggestionerrorController:', err);
        res.status(500).send('Server Error');
    }
};
