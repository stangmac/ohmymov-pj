const Movie = require('../models/Movies');

module.exports = async (req, res) => {
    try {
        const movieId = req.query.id;
        if (!movieId) {
            return res.status(400).send('Movie ID is required');
        }

        const movie = await Movie.findOne({ _id: movieId }).lean();

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        // ✅ ไม่ต้องเช็ค Array เพราะเป็น String แล้ว
        movie.teaser_url = movie.teaser_url || null;

        movie.duration_minute = movie.duration_minute !== undefined ? movie.duration_minute : 'N/A';
        movie.genres = Array.isArray(movie.genres) && movie.genres.length > 0 ? movie.genres : ['N/A'];


        
        // ✅ หาหนังที่มีแนว (`genres`) ตรงกัน
        let similarMovies = [];
        if (movie.genres && movie.genres.length > 0) {
            similarMovies = await Movie.find({
                genres: { $in: movie.genres },
                _id: { $ne: movieId }
            })
            .limit(4) // จำกัดให้แสดงแค่ 4 เรื่อง
            .select("_id title year poster_url rating_imdb rating_rotten watch")
            .lean();
        }

        console.log("🎬 Movie Data:", movie); // ✅ LOG เพื่อตรวจสอบค่าที่ส่งไปยัง EJS

        res.render('movie-detail', { movie , similarMovies });

    } catch (error) {
        console.error('❌ Error fetching movie details:', error);
        if (!res.headersSent) {
            res.status(500).send('Server Error');
        }
    }
};
