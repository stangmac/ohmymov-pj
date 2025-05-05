const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Movie = require('../models/Movies');
const { requireLogin } = require('../middleware/auth');

// GET /start (ดึง genre จากฐานข้อมูลจริง)
router.get('/start', requireLogin, async (req, res) => {
  try {
    const genresFromDB = await Movie.aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres" } },
      { $sort: { _id: 1 } }
    ]);

    const uniqueGenres = genresFromDB.map(g => g._id);
    res.render('start', { genres: uniqueGenres });
  } catch (err) {
    console.error("❌ Failed to fetch genres from DB:", err);
    res.status(500).send("Internal Server Error");
  }
});

// POST /save-genres
router.post('/save-genres', requireLogin, async (req, res) => {
  try {
    const selectedGenres = JSON.parse(req.body.selectedGenres);
    if (!Array.isArray(selectedGenres) || selectedGenres.length < 3) {
      return res.status(400).send('ต้องเลือกอย่างน้อย 3 หมวดหมู่');
    }

    await User.findByIdAndUpdate(req.session.user._id, {
      favoriteGenres: selectedGenres
    });

    return res.redirect('/suggestion');
  } catch (err) {
    console.error("❌ Error saving genres:", err);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
