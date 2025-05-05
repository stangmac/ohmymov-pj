const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, required: true },
    gender: { type: String, required: true },
    favoriteGenres: [{ type: String }],
    lastLogin: { type: Date, default: null },
    resetToken: { type: String, default: null }, // เพิ่มฟิลด์ resetToken
    resetTokenExpires: { type: Date, default: null }, // เพิ่มฟิลด์ resetTokenExpires

    // ✅ เพิ่มฟิลด์เก็บพฤติกรรมของผู้ใช้ (เก็บ movieId เป็น array)
    like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    seen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
