const Movie = require('../models/Movies');
const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.user?.id;
    const user = await User.findById(userId);

    const selectedGenres = user.favoriteGenres || [];
    const moviesByGenre = {};

    for (const genre of selectedGenres) {
      const movies = await Movie.find({ genres: genre }).limit(5);
      moviesByGenre[genre] = movies;
    }

 // ตรวจสอบก่อน render
  const userBehavior = {
    like: user.like.map(id => id.toString()),
    dislike: user.dislike.map(id => id.toString()),
    wishlist: user.wishlist.map(id => id.toString()),
    seen: user.seen.map(id => id.toString())
  };

  res.render('movie-preference', {
    selectedGenres,
    moviesByGenre,
    userBehavior // ✅ ส่งไป
  });
  } catch (error) {
    console.error("❌ Error rendering movie-preference:", error);
    res.status(500).send("Server Error");
  }
};
