const mongoose = require('mongoose');

const UserActionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  action: { type: String, enum: ['like', 'dislike', 'wishlist', 'seen'], required: true },
  timestamp: { type: Date, default: Date.now }
});

const UserAction = mongoose.model('UserAction', UserActionSchema);
module.exports = UserAction;
