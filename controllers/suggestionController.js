const User = require('../models/User');
const Movie = require('../models/Movies');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        // ✅ ใช้ id ที่ถูกต้อง
        const user = await User.findById(req.session.user.id).lean();

        if (!user) {
            return res.status(404).send("User not found");
        }

        // ✅ ดึงหนังที่ match กับ ObjectId ในแต่ละหมวด
        const [wishlist, like, seen, dislike] = await Promise.all([
            Movie.find({ _id: { $in: user.wishlist } }).lean(),
            Movie.find({ _id: { $in: user.like } }).lean(),
            Movie.find({ _id: { $in: user.seen } }).lean(),
            Movie.find({ _id: { $in: user.dislike } }).lean()
        ]);

        // ✅ ดึงหนังจาก movie_id (เลข) ใน recommendations
        const recMovieIds = user.recommendations.map(r => r.movie_id);
        const recommendations = await Movie.find({ movie_id: { $in: recMovieIds } }).lean();

        res.render('suggestion', {
            wishlist,
            like,
            seen,
            dislike,
            recommendations,
            loggedIN: user.username
        });

    } catch (err) {
        console.error('❌ Error in /suggestion:', err);
        res.status(500).send('Server Error');
    }
};
