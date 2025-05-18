const User = require('../models/User');
const Movie = require('../models/Movies');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        console.log("👤 Session user:", req.session.user); // Debug ดูค่า session

        // ✅ ใช้ _id แทน id
        const user = await User.findById(req.session.user._id).lean();

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

        // ✅ render หน้า suggestion พร้อมข้อมูล
        res.render('suggestion', {
            wishlist,
            like,
            seen,
            dislike,
            recommendations,
            loggedIN: user.username,
  currentPath: req.path
        });

    }catch (err) {
        console.error('❌ Error in /suggestion:', err);
        return res.redirect('/suggestionerror'); // ✅ redirect ไปหน้าที่คุณเตรียมไว้
    }
};
