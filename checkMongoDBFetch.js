const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/ohmymov', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Movie = mongoose.model('movie', new mongoose.Schema({}, { strict: false }), 'movie');

async function checkMongoDBFetch() {
    try {
        console.log("🔍 กำลังดึงข้อมูลจาก MongoDB...");
        const movies = await Movie.find({});
        console.log(`🎬 MongoDB คืนค่าหนังทั้งหมด: ${movies.length} เรื่อง`);

        if (movies.length < 2018) {
            console.warn(`⚠️ จำนวนหนังที่ MongoDB คืนค่ามาไม่ครบ: ขาด ${2018 - movies.length} เรื่อง`);
        } else {
            console.log("✅ MongoDB คืนค่าครบ 2018 เรื่อง");
        }
    } catch (error) {
        console.error("❌ Error fetching movies from MongoDB:", error);
    } finally {
        mongoose.connection.close();
    }
}

checkMongoDBFetch();
