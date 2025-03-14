const User = require('../models/User'); // นำเข้ารุ่น User จาก models/User

module.exports = async (req, res) => {
    try {
        // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
        if (!req.session.user) {
            return res.redirect('/login'); // ถ้าไม่ได้ล็อกอินให้ไปที่หน้า login
        }

        // ดึงข้อมูลผู้ใช้จาก MongoDB ตาม _id ที่บันทึกใน session
        const user = await User.findById(req.session.user.id);
        
        // ส่งข้อมูลผู้ใช้ไปที่หน้า user-profile.html
        res.render('user-profile', {
            loggedIN: user.username, // ส่งชื่อผู้ใช้ไปใช้ในส่วน loggedIN
            email: user.email,       // ส่งอีเมลผู้ใช้
            date: user.date,         // ส่งวันเดือนปีเกิดของผู้ใช้
            gender: user.gender      // ส่งข้อมูลเพศของผู้ใช้
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).send('Internal Server Error');
    }
};
