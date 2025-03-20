const mongoose = require('mongoose');
const Movie = require('../models/Movies');

module.exports = async (req, res) => {
    try {
        const genreFilter = req.query.genre;

        let query = {};
        if (genreFilter) {
            query.genres = genreFilter;
        }

        // ✅ ค้นหาหนังจากฐานข้อมูลตามประเภทที่เลือก
        const movies = await Movie.find(query)
            .select("movie_id title year poster_url rating_imdb rating_rotten watch")
            .lean();

        // ✅ ดึงประเภทหนังทั้งหมด
        const allGenres = await Movie.distinct("genres");

        res.render('all-content', { 
            movies, 
            sortedGenres: allGenres, 
            selectedGenre: genreFilter || "All Movies" 
        });

    } catch (error) {
        console.error('❌ Error fetching content:', error);
        res.status(500).send('Server Error');
    }
};
