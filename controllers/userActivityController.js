const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movies');
const UserAction = require('../models/UserAction'); // 👈 import model ใหม่

exports.logUserActivity = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.user?.id;
    const { movieId, action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ success: false, message: "Invalid movie ID" });
    }

    const objectId = new mongoose.Types.ObjectId(movieId);
    const user = await User.findById(userId);
    const movie = await Movie.findById(objectId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let removed = false;

    if (action === 'like') {
      const alreadyLiked = user.like.some(id => id.equals(objectId));
      if (alreadyLiked) {
        user.like = user.like.filter(id => !id.equals(objectId));
        if (movie) movie.like = Math.max(0, movie.like - 1);
        removed = true;
      } else {
        user.like.push(objectId);
        user.dislike = user.dislike.filter(id => !id.equals(objectId));
        if (movie) {
          movie.like += 1;
          movie.dislike = Math.max(0, movie.dislike - 1);
        }
      }
    } else if (action === 'dislike') {
      const alreadyDisliked = user.dislike.some(id => id.equals(objectId));
      if (alreadyDisliked) {
        user.dislike = user.dislike.filter(id => !id.equals(objectId));
        if (movie) movie.dislike = Math.max(0, movie.dislike - 1);
        removed = true;
      } else {
        user.dislike.push(objectId);
        user.like = user.like.filter(id => !id.equals(objectId));
        if (movie) {
          movie.dislike += 1;
          movie.like = Math.max(0, movie.like - 1);
        }
      }
    } else if (action === 'wishlist') {
      if (user.wishlist.some(id => id.equals(objectId))) {
        user.wishlist = user.wishlist.filter(id => !id.equals(objectId));
        removed = true;
      } else {
        user.wishlist.push(objectId);
      }
    } else if (action === 'seen') {
      if (user.seen.some(id => id.equals(objectId))) {
        user.seen = user.seen.filter(id => !id.equals(objectId));
        removed = true;
      } else {
        user.seen.push(objectId);
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await user.save();
    if (movie) await movie.save();

    // ✅ Save to UserActions (collection แยก)
    await UserAction.create({
      userId,
      movieId: objectId,
      action,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      removed,
      counts: {
        like: movie?.like ?? null,
        dislike: movie?.dislike ?? null
      },
      updatedActionList: user[action]
    });

  } catch (error) {
    console.error("❌ Error logUserActivity:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
