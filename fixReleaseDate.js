const { MongoClient } = require('mongodb');

async function fixReleaseDates() {
  const client = new MongoClient('mongodb+srv://stang:Satang13@cluster0.tah8c.mongodb.net');
  await client.connect();

  const db = client.db('ohmymov');
  const collection = db.collection('movie');

  // ✅ ค้นหาเฉพาะ release_date ที่ยังเป็น string และไม่ใช่ "Unknown"
  const cursor = collection.find({
    release_date: { $type: 'string', $ne: "Unknown" }
  });

  let count = 0;
  while (await cursor.hasNext()) {
    const movie = await cursor.next();
    const str = movie.release_date; // เช่น "31/12/2020"

    const parts = str.split('/');
    if (parts.length === 3) {
      const isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // YYYY-MM-DD
      if (!isNaN(isoDate)) {
        await collection.updateOne(
          { _id: movie._id },
          { $set: { release_date: isoDate } }
        );
        console.log(`✅ Updated: ${movie.title} (${str}) → ${isoDate.toISOString()}`);
        count++;
      } else {
        console.warn(`❌ Invalid date for ${movie.title}: ${str}`);
      }
    }
  }

  console.log(`🎉 Done. Updated ${count} movies.`);
  await client.close();
}

fixReleaseDates().catch(console.error);
