module.exports.requireLogin = (req, res, next) => {
    console.log("Session Data:", req.session);
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
};
