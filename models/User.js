const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({ 
    email: {
        type: String,
        required: [true, 'Please enter a valid email'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
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
        required: [true, 'Please enter a valid gender']
    },
    password: {
        type: String,
        required: [true, 'Please enter a valid password']
    },
    lastLogin: {  
        type: Date,
        default: null
    },
    resetToken: {  
        type: String,  
        default: null  
    },
    resetTokenExpires: {  
        type: Date,  
        default: null  
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
