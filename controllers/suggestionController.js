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
                        _id: fullMovie?._id || null,
                        poster_url: fullMovie?.poster_url || [],
                        year: fullMovie?.year || '',
                        rating_imdb: fullMovie?.rating_imdb || '',
                        rating_rotten: fullMovie?.rating_rotten || '',
                        platform: fullMovie?.platform || '',
                        watch: fullMovie?.watch || []
                    };
                });

                // ตรวจสอบว่ามีหนังในกลุ่มนั้นไหมก่อนจะ push เข้า recommendations
                if (enrichedMovies.length > 0) {
                    recommendations.push({
                        group_name: group.group_name,
                        movies: enrichedMovies
                    });
                }
            }
        }

        // ✅ ถ้าไม่มี recommendation เลยให้ redirect ไป /suggestionerror
        if (recommendations.length === 0) {
            return res.redirect('/suggestionerror');
        }

        res.render('suggestion', {
            wishlist,
            like,
            seen,
            dislike,
            recommendations,
            loggedIN: user.username,
            currentPath: req.path,
            user
        });

    } catch (err) {
        console.error('❌ Error in /suggestion:', err);
        return res.redirect('/suggestionerror');
    }
};
