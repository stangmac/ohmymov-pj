const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movies');

exports.logUserActivity = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.user?.id;
    const { movieId, action } = req.body;

    console.log("👤 session.user:", req.session.user);
    console.log("📽️ movieId:", movieId);
    console.log("🎬 action:", action);

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ success: false, message: "Invalid movie ID" });
    }

    const objectId = new mongoose.Types.ObjectId(movieId);
    const user = await User.findById(userId);
    const movie = await Movie.findById(objectId); // movie อาจไม่มีถ้าเป็น action อื่น (ต้องเช็คว่าใช้มั้ย)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let removed = false;

    // 🎯 LIKE
    if (action === 'like') {
      const alreadyLiked = user.like.some(id => id.equals(objectId));

      if (alreadyLiked) {
        user.like = user.like.filter(id => !id.equals(objectId));
        if (movie) movie.like = Math.max(0, movie.like - 1);
        removed = true;
      } else {
        user.like.push(objectId);

        // ลบ dislike ถ้ามี
        user.dislike = user.dislike.filter(id => !id.equals(objectId));
        if (movie) {
          movie.like += 1;
          if (movie.dislike > 0) movie.dislike = Math.max(0, movie.dislike - 1);
        }
        removed = false;
      }
    }

    // 🎯 DISLIKE
    else if (action === 'dislike') {
      const alreadyDisliked = user.dislike.some(id => id.equals(objectId));

      if (alreadyDisliked) {
        user.dislike = user.dislike.filter(id => !id.equals(objectId));
        if (movie) movie.dislike = Math.max(0, movie.dislike - 1);
        removed = true;
      } else {
        user.dislike.push(objectId);

        // ลบ like ถ้ามี
        user.like = user.like.filter(id => !id.equals(objectId));
        if (movie) {
          movie.dislike += 1;
          if (movie.like > 0) movie.like = Math.max(0, movie.like - 1);
        }
        removed = false;
      }
    }

    // 🎯 WISHLIST (toggle)
    else if (action === 'wishlist') {
      if (user.wishlist.some(id => id.equals(objectId))) {
        user.wishlist = user.wishlist.filter(id => !id.equals(objectId));
        removed = true;
      } else {
        user.wishlist.push(objectId);
        removed = false;
      }
    }

    // 🎯 SEEN (toggle)
    else if (action === 'seen') {
      if (user.seen.some(id => id.equals(objectId))) {
        user.seen = user.seen.filter(id => !id.equals(objectId));
        removed = true;
      } else {
        user.seen.push(objectId);
        removed = false;
      }
    }

    // 🔄 Save ทั้ง user และ movie (ถ้ามี)
    await user.save();
    if (movie) await movie.save();

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
