const Movie = require('../models/Movies');

module.exports = async (req, res) => {
    try {
        const genresFromDB = await Movie.aggregate([
            { $unwind: "$genres" },
            { $group: { _id: "$genres" } },
            { $sort: { _id: 1 } }
        ]);

        const uniqueGenres = genresFromDB.map(g => g._id);
        res.render('start', { genres: uniqueGenres });
    } catch (err) {
        res.status(500).send('Error loading genres: ' + err.message);
    }
};
