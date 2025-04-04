const User = require('../models/User'); // นำเข้ารุ่น User จาก models/User
const Movie = require('../models/Movies'); // ✅ เพิ่ม model หนัง

module.exports = async (req, res) => {
    try {
        // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
        if (!req.session.user) {
            return res.redirect('/login'); // ถ้าไม่ได้ล็อกอินให้ไปที่หน้า login
        }

        // ✅ ใช้ _id จาก session
        const user = await User.findById(req.session.user._id).lean();

        if (!user) {
            return res.status(404).send("User not found");
        }

        // ✅ ดึงหนังจากแต่ละหมวดที่ผู้ใช้เคยเพิ่มไว้
        const [wishlist, like, seen, dislike] = await Promise.all([
            Movie.find({ _id: { $in: user.wishlist || [] } }).lean(),
            Movie.find({ _id: { $in: user.like || [] } }).lean(),
            Movie.find({ _id: { $in: user.seen || [] } }).lean(),
            Movie.find({ _id: { $in: user.dislike || [] } }).lean()
        ]);

        // ✅ ส่งข้อมูลผู้ใช้ + ข้อมูลหนังไปที่หน้า user-profile.html
        res.render('user-profile', {
            loggedIN: user.username,
            email: user.email || '',
            date: user.date || '',
            gender: user.gender || '',
            wishlist,
            like,
            seen,
            dislike
        });
    } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        res.status(500).send('Internal Server Error');
    }
};
