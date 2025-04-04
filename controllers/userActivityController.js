const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movies');

exports.logUserActivity = async (req, res) => {
  try {
    const userId = req.session?.user?._id;
    const { movieId, action } = req.body;

    console.log("👤 session.user:", req.session.user);
    console.log("📽️ movieId:", movieId);
    console.log("🎬 action:", action);

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ success: false, message: "Invalid movie ID" });
    }

    const objectId = new mongoose.Types.ObjectId(movieId);
    const user = await User.findById(userId);
    const movie = await Movie.findById(objectId);

    if (!user || !movie) {
      return res.status(404).json({ success: false, message: "User or Movie not found" });
    }

    const alreadyExists = user[action].some(id => id.equals(objectId));

    if (alreadyExists) {
      // 👈 ถ้ากดซ้ำ จะยกเลิกการกระทำ
      user[action] = user[action].filter(id => !id.equals(objectId));
      if (action === 'like') movie.like = Math.max(0, movie.like - 1);
      if (action === 'dislike') movie.dislike = Math.max(0, movie.dislike - 1);
    } else {
      // 👈 ถ้ากดใหม่ จะเพิ่มการกระทำ และลบฝั่งตรงข้าม (เฉพาะที่เคยกด)
      user[action].push(objectId);

      if (action === 'like') {
        movie.like += 1;

        if (user.dislike.some(id => id.equals(objectId))) {
          user.dislike = user.dislike.filter(id => !id.equals(objectId));
          movie.dislike = Math.max(0, movie.dislike - 1);
        }
      }

      if (action === 'dislike') {
        movie.dislike += 1;

        if (user.like.some(id => id.equals(objectId))) {
          user.like = user.like.filter(id => !id.equals(objectId));
          movie.like = Math.max(0, movie.like - 1);
        }
      }
    }

    await user.save();
    await movie.save();

    res.json({
      success: true,
      removed: alreadyExists,
      counts: {
        like: movie.like,
        dislike: movie.dislike
      }
    });

  } catch (error) {
    console.error("❌ Error logUserActivity:", error);
    res.status(500).json({ success: false });
  }
};
