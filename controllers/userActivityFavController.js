const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movies');
const UserAction = require('../models/UserAction'); // ✅ import schema ใหม่

let actionCountMap = new Map(); // ใช้เก็บจำนวน action ต่อ session

exports.logFavActivity = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.user?.id;
    const { movieId, action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ success: false, message: "Invalid movie ID" });
    }

    const objectId = new mongoose.Types.ObjectId(movieId);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false });

    const movie = await Movie.findById(objectId);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    let removed = false;

    // 🎯 LIKE
    if (action === 'like') {
      const alreadyLiked = user.like.some(id => id.equals(objectId));
      if (alreadyLiked) {
        user.like = user.like.filter(id => !id.equals(objectId));
        movie.like = Math.max(0, movie.like - 1);
        removed = true;
      } else {
        user.like.push(objectId);
        user.dislike = user.dislike.filter(id => !id.equals(objectId));
        movie.like += 1;
        movie.dislike = Math.max(0, movie.dislike - 1);
      }
    }

    // 🎯 DISLIKE
    else if (action === 'dislike') {
      const alreadyDisliked = user.dislike.some(id => id.equals(objectId));
      if (alreadyDisliked) {
        user.dislike = user.dislike.filter(id => !id.equals(objectId));
        movie.dislike = Math.max(0, movie.dislike - 1);
        removed = true;
      } else {
        user.dislike.push(objectId);
        user.like = user.like.filter(id => !id.equals(objectId));
        movie.dislike += 1;
        movie.like = Math.max(0, movie.like - 1);
      }
    }

    // 🎯 WISHLIST (toggle)
    else if (action === 'wishlist') {
      if (user.wishlist.some(id => id.equals(objectId))) {
        user.wishlist = user.wishlist.filter(id => !id.equals(objectId));
        removed = true;
      } else {
        user.wishlist.push(objectId);
      }
    }

    // 🎯 SEEN (toggle)
    else if (action === 'seen') {
      if (user.seen.some(id => id.equals(objectId))) {
        user.seen = user.seen.filter(id => !id.equals(objectId));
        removed = true;
      } else {
        user.seen.push(objectId);
      }
    }

    // 🔄 Save ทั้ง user และ movie
    await user.save();
    await movie.save();

    // ✅ Save activity to UserAction only if action is not removed
    if (!removed) {
      await UserAction.create({
        userId,
        movieId: objectId,
        action
      });
    }

    // ✅ Update session-based action count
    const sessionId = req.sessionID;
    if (!actionCountMap.has(sessionId)) actionCountMap.set(sessionId, new Set());
    actionCountMap.get(sessionId).add(movieId);

    const totalActions = actionCountMap.get(sessionId).size;

    return res.json({
      success: true,
      redirect: totalActions >= 15
    });

  } catch (error) {
    console.error("❌ Error in logFavActivity:", error);
    res.status(500).json({ success: false });
  }
};
