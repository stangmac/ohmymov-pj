const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movies", required: true },
    action: { type: String, enum: ["like", "dislike", "seen", "wishlist"], required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserActivity", UserActivitySchema);
