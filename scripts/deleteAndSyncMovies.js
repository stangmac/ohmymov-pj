const mongoose = require('mongoose');
const client = require('../services/elasticsearch');
const fs = require('fs');

mongoose.connect('mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/ohmymov');


const Movie = mongoose.model('movie', new mongoose.Schema({}, { strict: false }), 'movie');

async function deleteAndSyncMovies() {
  try {
    const mongoMovieCount = await Movie.countDocuments({});
    console.log(`🎬 จำนวนหนังใน MongoDB: ${mongoMovieCount}`);

    const indexExists = await client.indices.exists({ index: 'movie' });

    if (indexExists) {
      console.log('🗑️ กำลังลบ Index "movie" ใน Elasticsearch...');
      await client.indices.delete({ index: 'movie' });
    }

    console.log('📌 กำลังสร้าง Index "movie" ใหม่...');
    await client.indices.create({
      index: 'movie',
      body: {
        mappings: {
          properties: {
            movie_id: { type: 'integer' },
            title: { type: 'text' },
            genres: { type: 'keyword' },
            keywords: { type: 'text' },
            synopsis: { type: 'text' },
            cast: {
              type: 'nested',
              properties: {
                national_name: { type: 'text' }
              }
            },
            crew: {
              type: 'nested',
              properties: {
                role: { type: 'keyword' },
                members: { type: 'text' }
              }
            },
            year: { type: 'keyword' },
            release_date: { type: 'text' },
            popularity_score: { type: 'float' },
            watch_count: { type: 'integer' },
            poster_url: { type: 'text' },
            watch: { type: 'keyword' },
            rating_imdb: { type: 'text' },
            rating_rotten: { type: 'text' }
          }
        }
      }
    });

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
    let newTitles = [];

    for (let movie of movies) {
      if (!movie.title || !movie.movie_id) {
        console.warn(`⚠️ ข้ามหนังที่ข้อมูลไม่สมบูรณ์: ${movie._id}`);
        continue;
      }

      let watchCount = Number(movie.watch_count);
      if (isNaN(watchCount)) watchCount = 0;

      bulkBody.push({ index: { _index: 'movie', _id: movie._id.toString() } });
      bulkBody.push({
        movie_id: movie.movie_id,
        title: movie.title,
        genres: movie.genres || [],
        synopsis: movie.synopsis || "No synopsis available",
        keywords: movie.keywords || [],
        cast: Array.isArray(movie.cast)
          ? movie.cast.map(c => ({ national_name: c.national_name || c }))
          : [],
        crew: Array.isArray(movie.crew)
          ? movie.crew.map(c => ({
              role: c.role,
              members: c.members || []
            }))
          : [],
        year: movie.year || "Unknown",
        release_date: movie.release_date || "Unknown",
        popularity_score: movie.popularity_score || 0,
        watch_count: watchCount,
        poster_url:
          movie.poster_url && Array.isArray(movie.poster_url) && movie.poster_url.length > 0
            ? movie.poster_url[0]
            : null,
        watch: movie.watch || [],
        rating_imdb: movie.rating_imdb || "N/A",
        rating_rotten: movie.rating_rotten || "N/A"
      });

      newTitles.push(movie.title);
      syncedCount++;

      if (bulkBody.length >= 500) {
        await uploadBulk(bulkBody, failedMovies, failedErrors);
        bulkBody = [];
        console.log(`✅ Synced ${syncedCount}/${movies.length} เรื่อง...`);
      }
    }

    if (bulkBody.length > 0) {
      await uploadBulk(bulkBody, failedMovies, failedErrors);
    }

    await client.indices.refresh({ index: "movie" });

    const { count } = await client.count({ index: "movie" });
    console.log(`📊 ตรวจสอบแล้ว จำนวนหนังใน Elasticsearch: ${count} เรื่อง`);

    if (newTitles.length > 0) {
      console.log('\n📃 รายชื่อหนังใหม่ที่เพิ่งเพิ่มลง Elasticsearch:\n');
      newTitles.forEach((title, index) => {
        console.log(`  ${index + 1}. ${title}`);
      });
      console.log(`\n✅ รวมทั้งหมด ${newTitles.length} เรื่อง\n`);
    } else {
      console.log('\uD83D\uDCEC \u0E44\u0E21\u0E48\u0E21\u0E35\u0E2B\u0E19\u0E31\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E17\u0E35\u0E48\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E02\u0E49\u0E32\u0E44\u0E19\u0E23\u0E2D\u0E1A\u0E19\u0E35\u0E49');
    }

    if (failedMovies.length > 0) {
      fs.writeFileSync('failedMovies.json', JSON.stringify(failedMovies, null, 2));
      fs.writeFileSync('failedErrors.json', JSON.stringify(failedErrors, null, 2));
      console.error(`⛔ มี ${failedMovies.length} เรื่องที่ Sync ไม่สำเร็จ (ดูในไฟล์ failedMovies.json)`);
    } else {
      console.log(`✅ Sync สำเร็จสำเริญ!`);
    }

  } catch (error) {
    console.error('❌ Error syncing movies:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function uploadBulk(bulkBody, failedMovies, failedErrors) {
  try {
    const response = await client.bulk({ refresh: "wait_for", body: bulkBody });
    if (response.errors) {
      response.items.forEach((item, index) => {
        if (item.index && item.index.error) {
          failedMovies.push(bulkBody[index * 2 + 1]);
          failedErrors.push(item.index.error);
        }
      });
    }
  } catch (err) {
    console.error("❌ Bulk upload failed:", err);
  }
}

deleteAndSyncMovies();
