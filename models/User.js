const mongoose = require('mongoose')
const Schema =mongoose.Schema
const bcrypt = require('bcrypt')


//create keep database
const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Please enter a valid email address']
    },
    username: {
        type: String,
        required: [true, 'Please enter a valid username']
    },
    date: {
        type: Date,
        required: [true, 'Please enter a valid Birth date']
    },
    gender: {
        type: String,
        required: [true, 'Please enter a valid Your gender']
    },
    password: {
        type: String,
        required: [true, 'Please enter a valid password']
    },
    confirm_password: {
        type: String,
        required: [true, 'Please enter a valid confirm password']
    }
})

//hash password
UserSchema.pre('save', function(next) {
    const user =this

    bcrypt.hash(user.password, 10).then(hash => {
        user.password = hash
        next()
    }).catch(error => {
        console.error(error)
    }),
    bcrypt.hash(user.confirm_password, 10).then(hash => {
        user.confirm_password = hash
        next()
    }).catch(error => {
        console.error(error)
    })

    })


    const User = mongoose.model('User', UserSchema)
    module.exports = User