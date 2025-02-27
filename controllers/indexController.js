module.exports = (req, res) => {
    res.render('home', {
        errors: req.flash('validationError')
    })
}