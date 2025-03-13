const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({ 
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
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
}, { collection: 'user' }); // ✅ ระบุ collection 'user' ที่มีอยู่แล้ว

const User = mongoose.model('User', UserSchema);
module.exports = User;
