const User = require('../models/User');
const Movie = require('../models/Movies');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        console.log("👤 Session user:", req.session.user);

        const user = await User.findById(req.session.user._id).lean();

        if (!user) {
            return res.status(404).send("User not found");
        }

        const [wishlist, like, seen, dislike] = await Promise.all([
            Movie.find({ _id: { $in: user.wishlist } }).lean(),
            Movie.find({ _id: { $in: user.like } }).lean(),
            Movie.find({ _id: { $in: user.seen } }).lean(),
            Movie.find({ _id: { $in: user.dislike } }).lean()
        ]);

        const recommendations = [];

        if (user.Recommend && Array.isArray(user.Recommend)) {
            for (const group of user.Recommend) {
                const movieIds = group.movies.map(m => m.movie_id);
                const movies = await Movie.find({ movie_id: { $in: movieIds } }).lean();

                const enrichedMovies = group.movies.map(rec => {
                    const fullMovie = movies.find(m => m.movie_id === rec.movie_id);
                    return {
                        ...rec,
                        _id: fullMovie?._id || null, // ✅ เพิ่ม _id เพื่อใช้ใน EJS
                        poster_url: fullMovie?.poster_url || [],
                        year: fullMovie?.year || '',
                        rating_imdb: fullMovie?.rating_imdb || '',
                        rating_rotten: fullMovie?.rating_rotten || '',
                        platform: fullMovie?.platform || '',
        watch: fullMovie?.watch || [] // ✅ เพิ่มบรรทัดนี้
                    };
                });

                recommendations.push({
                    group_name: group.group_name,
                    movies: enrichedMovies
                });
            }
        }

        res.render('suggestion', {
            wishlist,
            like,
            seen,
            dislike,
            recommendations,
            loggedIN: user.username,
            currentPath: req.path,
            user // ✅ ส่ง user ไปให้ EJS ตรวจสอบพฤติกรรม
        });

    } catch (err) {
        console.error('❌ Error in /suggestion:', err);
        return res.redirect('/suggestionerror');
    }
};
