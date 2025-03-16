const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    action: { type: String, enum: ["view", "trailer", "like", "dislike", "seen", "wishlist"], required: true },
    timestamp: { type: Date, default: Date.now }
});

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

module.exports = UserActivity;
