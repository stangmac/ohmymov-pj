// controllers/indexController.js
const Movie = require('../models/Movies');
const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    console.log("📢 Fetching movies from database...");
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ตัดเวลาออกให้เทียบเฉพาะวัน

    // ดึงหนังทั้งหมด และ Top Like
    const [movies, topMovies] = await Promise.all([
      Movie.find({})
        .select("title year genres poster_url like rating_imdb rating_rotten watch release_date")
        .lean(),

      Movie.find({})
        .sort({ like: -1 })
        .limit(10)
        .select("title year genres poster_url like rating_imdb rating_rotten watch")
        .lean()
    ]);

    // แปลง release_date จาก String → Date แล้วกรองเฉพาะหนังที่ฉายแล้ว
    const latestMovies = movies
      .filter(m => {
        if (!m.release_date) return false;
        const release = new Date(m.release_date);
        return !isNaN(release) && release <= today;
      })
      .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
      .slice(0, 10);

    // รวม genre ทั้งหมด
    const allGenres = new Set();
    movies.forEach(movie => {
      if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach(genre => allGenres.add(genre.trim()));
      }
      movie.watch = Array.isArray(movie.watch) ? movie.watch : [];
    });
    const sortedGenres = [...allGenres].sort();

    // ดึงข้อมูลผู้ใช้
    let user = null;
    if (req.session.user && req.session.user._id) {
      user = await User.findById(req.session.user._id).lean();
    }

    // Logging
    console.log("✅ Movies fetched:", movies.length);
    console.table(movies.slice(0, 3));
    console.log("🏆 Top Movies:", topMovies.length);
    console.log("🆕 Latest Movies:", latestMovies.length);
    console.log("👤 User from DB:", user);

    // Render หน้า home
    res.render('home', {
      movies: movies || [],
      topMovies: topMovies.length ? topMovies : movies.slice(0, 10),
      latestMovies: latestMovies || [],
      sortedGenres: sortedGenres.length ? sortedGenres : [],
      user,
      currentPath: req.path
    });

  } catch (err) {
    console.error("❌ Error fetching movies:", err);
    res.status(500).send("Error fetching movies: " + err.message);
  }
};
