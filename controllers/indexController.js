const Movie = require('../models/Movies');
const User = require('../models/User'); // ⬅️ เพิ่มการ import User model

module.exports = async (req, res) => {
  try {
    console.log("📢 Fetching movies from database...");

    // ✅ ดึงหนังทั้งหมด และ Top Like และ หนังล่าสุด
    const [movies, topMovies, latestMovies] = await Promise.all([
      Movie.find({})
        .select("title year genres poster_url like rating_imdb rating_rotten watch")
        .lean(),

      Movie.find({})
        .sort({ like: -1 })
        .limit(10)
        .select("title year genres poster_url like rating_imdb rating_rotten watch")
        .lean(),

      Movie.find({})
        .sort({ release_date: -1 }) // ✅ หนังใหม่ล่าสุด
        .limit(10)
        .select("title poster_url release_date")
        .lean()
    ]);

    // ✅ จัด genre ทั้งหมดจากหนัง
    const allGenres = new Set();
    movies.forEach(movie => {
      if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach(genre => allGenres.add(genre.trim()));
      }
      movie.watch = Array.isArray(movie.watch) ? movie.watch : [];
    });
    const sortedGenres = [...allGenres].sort();

 // ✅ โหลดข้อมูล user จาก session ถ้า login
        let user = null;
        if (req.session.user && req.session.user._id) {
            user = await User.findById(req.session.user._id).lean();
        }
    // ✅ log ตรวจสอบข้อมูล
    if (!movies.length) console.warn("⚠️ No movies found.");
    if (!topMovies.length) console.warn("⚠️ No top movies found.");
    if (!latestMovies.length) console.warn("⚠️ No latest movies found.");

    console.log("✅ Movies fetched:", movies.length);
    console.table(movies.slice(0, 3));
    console.log("🏆 Top Movies:", topMovies.length);
    console.log("🆕 Latest Movies:", latestMovies.length);

    // ✅ ส่งข้อมูลไปหน้า home
res.render('home', {
  movies: movies || [],
  topMovies: topMovies.length ? topMovies : movies.slice(0, 10),
  latestMovies: latestMovies || [],
  sortedGenres: sortedGenres.length ? sortedGenres : [],
  user, // ✅ ใช้ user จาก MongoDB (มีข้อมูล wishlist, like, seen ที่อัปเดตแล้ว)
  currentPath: req.path
});

console.log("👤 User from DB:", user);
  } catch (err) {
    console.error("❌ Error fetching movies:", err);
    res.status(500).send("Error fetching movies: " + err.message);
  }
};
