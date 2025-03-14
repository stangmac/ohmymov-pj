module.exports.requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login'); // ถ้ายังไม่ได้ Login ให้ไปที่หน้า Login
    }
    next(); // ถ้า Login แล้วให้ทำงานต่อไป
};
