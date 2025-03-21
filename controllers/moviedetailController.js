const mongoose = require('mongoose');
const Movie = require('../models/Movies');

module.exports = async (req, res) => {
    try {
        const movieId = req.query.id;

        if (!movieId) {
            return res.status(400).send('Movie ID is required');
        }

        // ✅ ตรวจสอบว่า movieId เป็น ObjectId ที่ถูกต้อง
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            return res.status(400).send('Invalid movie ID format');
        }

        const objectId = new mongoose.Types.ObjectId(movieId);

        // ✅ ค้นหาข้อมูลหนัง
        const movie = await Movie.findById(objectId).lean();

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        // ✅ กำหนดค่าเริ่มต้นหากไม่มีข้อมูล
        movie.teaser_url = movie.teaser_url || "No trailer available";
        movie.duration_minute = movie.duration_minute !== undefined ? movie.duration_minute : 'N/A';
        movie.genres = Array.isArray(movie.genres) && movie.genres.length > 0 ? movie.genres : ['N/A'];
        movie.watch = Array.isArray(movie.watch) && movie.watch.length > 0 ? movie.watch : ['Not available'];

        // ✅ ดึง `recommendations` และเรียงตาม `similarity`
        let similarMovies = [];
        if (movie.recommendations && movie.recommendations.length > 0) {
            const recommendedIds = movie.recommendations.map(rec => rec.movie_id);

            // ✅ ดึงข้อมูลหนังที่มีอยู่จริงในฐานข้อมูล
            let fetchedMovies = await Movie.find({ movie_id: { $in: recommendedIds } })
                .select("movie_id title year poster_url rating_imdb rating_rotten watch")
                .lean();

            // ✅ ใช้ Map เก็บค่า similarity เพื่อเรียงลำดับ
            const similarityMap = new Map(movie.recommendations.map(rec => [rec.movie_id, rec.similarity]));

            // ✅ จัดเรียงลำดับตาม `similarity` มากไปน้อย และเลือกแค่ 6 เรื่อง
            similarMovies = fetchedMovies
                .map(movie => ({ ...movie, similarity: similarityMap.get(movie.movie_id) || 0 }))
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 6);
        }

        console.log("🎬 Movie Data Sent to EJS:", movie);
        console.log("🔗 Similar Movies (Sorted by Similarity):", similarMovies);

        res.render('movie-detail', { movie, similarMovies });

    } catch (error) {
        console.error('❌ Error fetching movie details:', error);
        if (!res.headersSent) {
            res.status(500).send('Server Error');
        }
    }
};
