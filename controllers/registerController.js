module.exports = (req, res) => {
    let email = "";
    let username = "";
    let dateBirth = "";
    let gender = "";
    let password = "";
    let confirmPassword = "";

    let data = req.flash('data')[0];

    if (typeof data !== "undefined") {
        email = data.email || "";
        username = data.username || "";
        dateBirth = data.dateOfBirth || "";
        gender = data.gender || "";
        password = data.password || "";
        confirmPassword = data.confirmPassword || "";
    }

    res.render('register', {
        error: req.flash('validationError')[0] || {},
        email: email,
        username: username,
        dateOfBirth: dateBirth,
        gender: gender,
        password: password,
        confirmPassword: confirmPassword
    });
};
