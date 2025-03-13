const Movie = require('../models/Movies');

module.exports = async (req, res) => {
    try {
        console.log("📢 Fetching movies from database...");

        const [movies, topMovies] = await Promise.all([
            Movie.find({})
                .select("title year genres poster_url like rating_imdb rating_rotten watch") // ✅ แก้ watch_platforms → watch
                .lean(),

            Movie.find({})
                .sort({ like: -1 })
                .limit(10)
                .select("title year genres poster_url like rating_imdb rating_rotten watch") // ✅ แก้ watch_platforms → watch
                .lean()
        ]);

        const allGenres = new Set();
        movies.forEach(movie => {
            if (movie.genres && Array.isArray(movie.genres)) {
                movie.genres.forEach(genre => allGenres.add(genre.trim()));
            }
            // ✅ ตรวจสอบ watch ให้แน่ใจว่าเป็น array
            movie.watch = Array.isArray(movie.watch) ? movie.watch : [];
        });

        const sortedGenres = [...allGenres].sort();

        if (!movies.length) {
            console.warn("⚠️ Warning: No movies found in the database.");
        } else {
            console.log("✅ Movies fetched:", movies.length);
            console.table(movies.slice(0, 5));
        }

        if (!topMovies.length) {
            console.warn("⚠️ Warning: No top movies found in the database.");
        } else {
            console.log("🏆 Top Movies fetched:", topMovies.length);
            console.table(topMovies.slice(0, 5));
        }

        res.render('home', { 
            movies: movies || [],
            topMovies: topMovies.length ? topMovies : movies.slice(0, 10),
            sortedGenres: sortedGenres.length ? sortedGenres : [] // ✅ ป้องกัน undefined
        });

    } catch (err) {
        console.error("❌ Error fetching movies:", err);
        res.status(500).send("Error fetching movies: " + err.message);
    }
};
