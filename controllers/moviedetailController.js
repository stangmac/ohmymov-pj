const mongoose = require('mongoose');
const Movie = require('../models/Movies');
const User = require('../models/User'); // ✅ เพิ่ม import User

module.exports = async (req, res) => {
    try {
        const movieId = req.query.id;

        if (!movieId) {
            return res.status(400).send('Movie ID is required');
        }

        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).send('Invalid movie ID format');
        }

        const objectId = new mongoose.Types.ObjectId(movieId);
        const movie = await Movie.findById(objectId).lean();

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        movie.teaser_url = movie.teaser_url || "No trailer available";
        movie.duration_minute = movie.duration_minute !== undefined ? movie.duration_minute : 'N/A';
        movie.genres = Array.isArray(movie.genres) && movie.genres.length > 0 ? movie.genres : ['N/A'];
        movie.watch = Array.isArray(movie.watch) && movie.watch.length > 0 ? movie.watch : ['Not available'];

        // ✅ โหลดข้อมูล user จาก session ถ้า login
        let user = null;
        if (req.session.user && req.session.user._id) {
            user = await User.findById(req.session.user._id).lean();
        }

        // ✅ ดึง recommendations
        let similarMovies = [];
        if (movie.recommendations && movie.recommendations.length > 0) {
            const recommendedIds = movie.recommendations.map(rec => rec.movie_id);

            let fetchedMovies = await Movie.find({ movie_id: { $in: recommendedIds } })
                .select("movie_id title year poster_url rating_imdb rating_rotten watch")
                .lean();

            const similarityMap = new Map(movie.recommendations.map(rec => [rec.movie_id, rec.similarity]));

            similarMovies = fetchedMovies
                .map(m => ({ ...m, similarity: similarityMap.get(m.movie_id) || 0 }))
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 6);
        }

        console.log("🎬 Movie Data Sent to EJS:", movie);
        console.log("👤 User Data Sent to EJS:", user?.username || 'Guest');

        // ✅ ส่ง user เข้า view ด้วย
        res.render('movie-detail', { movie, similarMovies, user,
  currentPath: req.path });

    } catch (error) {
        console.error('❌ Error fetching movie details:', error);
        if (!res.headersSent) {
            res.status(500).send('Server Error');
        }
    }
};
