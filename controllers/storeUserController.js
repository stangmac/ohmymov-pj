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

// const User = require('../models/User')

// module.exports = (req, res) => {
//     // Check if the password and confirm password match
//     if (req.body.password !== req.body.confirm_password) {
//         req.flash('validationError', { confirm_password: 'Passwords do not match' });
//         req.flash('data', req.body);
//         return res.redirect('/register');
//     }

//     // Proceed with creating the user if passwords match
//     User.create(req.body)
//         .then(() => {
//             console.log("User registered successfully!");
//             res.redirect('/');
//         })
//         .catch((error) => {
//             if (error) {
//                 const validationErrors = {};
//                 if (error.errors) {
//                     for (const field in error.errors) {
//                         validationErrors[field] = error.errors[field].message;
//                     }
//                 }
//                 req.flash('validationError', validationErrors);
//                 req.flash('data', req.body);
//                 return res.redirect('/register');
//             }
//         });
// };

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    try {
        console.log("Received signup request:", req.body);

        const { username, dateOfBirth, gender, password, confirm_password } = req.body;

        // Check if all fields are present
        if (!username || !dateOfBirth || !gender || !password || !confirm_password) {
            console.log("Missing fields");
            return res.status(400).send("All fields are required");
        }

        // Check if passwords match
        if (password !== confirm_password) {
            console.log("Passwords do not match");
            return res.status(400).send("Passwords do not match");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            date: dateOfBirth,  // Store it in the 'date' field as per your model
            gender,
            password: hashedPassword
        });

        // Save to database
        await newUser.save();
        console.log("User successfully registered!");

        // Redirect user after successful registration
        res.redirect('/home-new');  // Change '/login' to the desired page
    } catch (err) {
        console.error("Error saving user:", err.message);
        res.status(500).send("Error saving user: " + err.message);
    }
});

module.exports = router;

   