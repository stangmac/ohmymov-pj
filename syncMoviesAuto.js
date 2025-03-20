const mongoose = require('mongoose');
const client = require('./services/elasticsearch');

mongoose.connect('mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/ohmymov', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Movie = mongoose.model('movie', new mongoose.Schema({}, { strict: false }), 'movie');

const watchMovieChanges = async () => {
    console.log("📡 กำลังเฝ้าดูการเปลี่ยนแปลงใน MongoDB...");

    const changeStream = Movie.watch();

    changeStream.on('change', async (change) => {
        console.log(`🔄 มีการเปลี่ยนแปลงใน Collection: ${change.operationType}`);

        try {
            if (change.operationType === 'insert' || change.operationType === 'update') {
                const movie = await Movie.findById(change.documentKey._id);

                if (!movie) return;

                let watchCount = Number(movie.watch_count);
                if (isNaN(watchCount)) watchCount = 0;

                const movieData = {
                    movie_id: movie.movie_id,
                    title: movie.title,
                    genres: movie.genres || [],
                    synopsis: movie.synopsis || "No synopsis available",
                    keywords: movie.keywords || [],
                    cast: Array.isArray(movie.cast) ? movie.cast.map(c => (c.national_name || c)) : [],
                    crew: Array.isArray(movie.crew) ? movie.crew.map(c => (c.national_name || c)) : [],
                    year: movie.year || "Unknown",
                    release_date: movie.release_date || "Unknown",
                    popularity_score: movie.popularity_score || 0,
                    watch_count: watchCount,
                    poster_url: movie.poster_url && Array.isArray(movie.poster_url) && movie.poster_url.length > 0
                        ? movie.poster_url[0]
                        : null
                };

                await client.index({
                    index: 'movie',
                    id: movie._id.toString(),
                    body: movieData
                });

                console.log(`✅ อัปเดตข้อมูลใน Elasticsearch: ${movie.title}`);

            } else if (change.operationType === 'delete') {
                await client.delete({
                    index: 'movie',
                    id: change.documentKey._id.toString()
                });
                console.log(`🗑️ ลบหนังออกจาก Elasticsearch`);
            }
        } catch (error) {
            console.error(`❌ Error อัปเดตข้อมูลใน Elasticsearch`, error);
        }
    });

    changeStream.on('error', (error) => {
        console.error(`❌ MongoDB Change Stream Error:`, error);
    });
};

watchMovieChanges();
