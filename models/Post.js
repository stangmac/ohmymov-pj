const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  text: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    created_at: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Post', postSchema);
