const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActivitySchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  action: {
    type: String,
    enum: ['view_movie', 'watch_trailer', 'view_details', 'like', 'dislike', 'seen', 'wishlist'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
module.exports = UserActivity;
