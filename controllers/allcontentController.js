const mongoose = require('mongoose');
const Movie = require('../models/Movies');
const User = require('../models/User'); // ✅ เพิ่มบรรทัดนี้

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
// ✅ โหลดข้อมูล user จาก session ถ้า login
        let user = null;
        if (req.session.user && req.session.user._id) {
            user = await User.findById(req.session.user._id).lean();
        }
        // ✅ ดึงประเภทหนังทั้งหมด (ไว้ใช้แสดงปุ่มหรือเลือกหมวด)
        const allGenres = await Movie.distinct("genres");

        // ✅ ส่ง user เข้า EJS template ด้วย
        res.render('all-content', { 
            movies, 
            sortedGenres: allGenres, 
            selectedGenre: genreFilter || "All Movies",
            user: req.session.user ,
            user// ✅ ส่งข้อมูลผู้ใช้ (wishlist, etc.)
        });

    } catch (error) {
        console.error('❌ Error fetching content:', error);
        res.status(500).send('Server Error');
    }
};
