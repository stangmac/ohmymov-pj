const User = require('../models/User'); // นำเข้ารุ่น User จาก models/User
const Movie = require('../models/Movies'); // นำเข้า model หนัง

module.exports = async (req, res) => {
    try {
        // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
        if (!req.session.user) {
            return res.redirect('/login'); // ถ้ายังไม่ล็อกอิน ให้ redirect ไปหน้า login
        }

        // ใช้ _id ที่เก็บไว้ใน session เพื่อดึงข้อมูลผู้ใช้
        const user = await User.findById(req.session.user._id).lean();

        if (!user) {
            return res.status(404).send("User not found");
        }

        // ดึงรายการหนังแต่ละหมวดจาก ID ที่ผู้ใช้เคยบันทึกไว้
        const [wishlist, like, seen, dislike] = await Promise.all([
            Movie.find({ _id: { $in: user.wishlist || [] } }).lean(),
            Movie.find({ _id: { $in: user.like || [] } }).lean(),
            Movie.find({ _id: { $in: user.seen || [] } }).lean(),
            Movie.find({ _id: { $in: user.dislike || [] } }).lean()
        ]);

        // ส่งข้อมูลไปยังหน้า user-profile.ejs / user-profile.html
        res.render('user-profile', {
            loggedIN: user.username || '',
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
