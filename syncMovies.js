const mongoose = require('mongoose');
const client = require('./services/elasticsearch');
const fs = require('fs');

mongoose.connect('mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/ohmymov', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Movie = mongoose.model('movie', new mongoose.Schema({}, { strict: false }), 'movie');

async function deleteAndSyncMovies() {
    try {
        const mongoMovieCount = await Movie.countDocuments({});
        console.log(`🎬 จำนวนหนังใน MongoDB: ${mongoMovieCount}`);

        const indexExists = await client.indices.exists({ index: 'movie' });

        if (indexExists) {
            console.log('🗑️ กำลังลบ Index "movie" ใน Elasticsearch...');
            await client.indices.delete({ index: 'movie' });
        } else {
            console.log('⚠️ ไม่มี Index "movie" ให้ลบ (ข้ามขั้นตอนนี้)');
        }

        console.log('📌 กำลังสร้าง Index "movie" ใหม่...');
        await client.indices.create({ index: 'movie' });

        const movies = await Movie.find({});
        console.log(`🔍 กำลัง Sync หนัง ${movies.length} เรื่องจาก MongoDB...`);

        if (movies.length === 0) {
            console.log('❌ ไม่มีข้อมูลให้ Sync');
            return;
        }

        let bulkBody = [];
        let syncedCount = 0;
        let failedMovies = [];
        let failedErrors = [];

        for (let movie of movies) {
            if (!movie.title || !movie.movie_id) {
                console.warn(`⚠️ ข้ามหนังที่ข้อมูลไม่สมบูรณ์: ${movie._id}`);
                continue;
            }

            // ✅ ตรวจสอบค่าของ `watch_count` ให้เป็นตัวเลขเสมอ
            let watchCount = Number(movie.watch_count);
            if (isNaN(watchCount)) {
                watchCount = 0; // เปลี่ยนค่า "Unknown" เป็น 0
            }

            bulkBody.push({ index: { _index: 'movie', _id: movie._id.toString() } });
            bulkBody.push({
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
                watch_count: watchCount, // ✅ ตรวจสอบแล้วเป็นตัวเลขแน่นอน
                poster_url: movie.poster_url && Array.isArray(movie.poster_url) && movie.poster_url.length > 0 
                            ? movie.poster_url[0] 
                            : null
            });

            syncedCount++;

            if (bulkBody.length >= 500) {
                try {
                    const response = await client.bulk({ refresh: "wait_for", body: bulkBody });
                    if (response.errors) {
                        console.error(`⛔ พบข้อผิดพลาดในการ Sync (บางเรื่องอาจไม่ได้เพิ่มลง Elasticsearch)`);
                        response.items.forEach((item, index) => {
                            if (item.index && item.index.error) {
                                console.error(`❌ ERROR (${item.index.status}):`, item.index.error);
                                failedMovies.push(bulkBody[index * 2 + 1]);
                                failedErrors.push(item.index.error);
                            }
                        });
                    }
                } catch (err) {
                    console.error(`❌ Error ในการ Sync:`, err);
                }
                bulkBody = [];
                console.log(`✅ Synced ${syncedCount}/${movies.length} เรื่อง...`);
            }
        }

        if (bulkBody.length > 0) {
            try {
                const response = await client.bulk({ refresh: "wait_for", body: bulkBody });
                if (response.errors) {
                    console.error(`⛔ พบข้อผิดพลาดในการ Sync (บางเรื่องอาจไม่ได้เพิ่มลง Elasticsearch)`);
                    response.items.forEach((item, index) => {
                        if (item.index && item.index.error) {
                            console.error(`❌ ERROR (${item.index.status}):`, item.index.error);
                            failedMovies.push(bulkBody[index * 2 + 1]);
                            failedErrors.push(item.index.error);
                        }
                    });
                }
            } catch (err) {
                console.error(`❌ Error ในการ Sync:`, err);
            }
        }

        await client.indices.refresh({ index: "movie" });

        const { count } = await client.count({ index: "movie" });

        console.log(`📊 ตรวจสอบแล้ว จำนวนหนังใน Elasticsearch: ${count} เรื่อง`);
        if (count < 2018) {
            console.warn(`⚠️ Elasticsearch ยังขาด ${2018 - count} เรื่อง`);
        } else {
            console.log(`✅ Sync หนังครบ 2018 เรื่องแล้ว!`);
        }

        if (failedMovies.length > 0) {
            console.error(`⛔ มี ${failedMovies.length} เรื่องที่ Sync ไม่สำเร็จ`);
            fs.writeFileSync('failedMovies.json', JSON.stringify(failedMovies, null, 2));
            fs.writeFileSync('failedErrors.json', JSON.stringify(failedErrors, null, 2));
            console.log(`📂 บันทึกข้อมูลหนังที่ล้มเหลวลงไฟล์ failedMovies.json และข้อผิดพลาดลง failedErrors.json แล้ว`);
        }

    } catch (error) {
        console.error('❌ Error syncing movies:', error);
    } finally {
        mongoose.connection.close();
    }
}

deleteAndSyncMovies();
