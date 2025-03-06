// const User = require('../models/User')
// module.exports = (req, res) => {
//     User.create(req.body).then(()=> {
//         console.log("User registered successfully!")
//         res.redirect('/')
//     }).catch((error) => {
//         // console.log(error.errors)
//     if (error){
//         const validationError = Object.keys(error.errors).map(key => error.errors[key].message)
//         req.flash('validationError', validationError)
       
//         return res.redirect('/register')
//     }
//     })

// }

const User = require('../models/User')

module.exports = (req, res) => {
    // Check if the password and confirm password match
    if (req.body.password !== req.body.confirm_password) {
        req.flash('validationError', { confirm_password: 'Passwords do not match' });
        req.flash('data', req.body);
        return res.redirect('/register');
    }

    // Proceed with creating the user if passwords match
    User.create(req.body)
        .then(() => {
            console.log("User registered successfully!");
            res.redirect('/');
        })
        .catch((error) => {
            if (error) {
                const validationErrors = {};
                if (error.errors) {
                    for (const field in error.errors) {
                        validationErrors[field] = error.errors[field].message;
                    }
                }
                req.flash('validationError', validationErrors);
                req.flash('data', req.body);
                return res.redirect('/register');
            }
        });
};
