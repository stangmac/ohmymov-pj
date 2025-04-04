// fixDurationField.js

const mongoose = require('mongoose');
const dbUrl = 'mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/ohmymov';

async function fixUnknownDuration() {
  try {
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB');

    // ดึง collection ตรงจาก native driver เพื่อหลีกเลี่ยง schema validation
    const result = await mongoose.connection.db
      .collection('movie') // ✅ ใช้ชื่อ collection จริง (เล็กพิมพ์เล็ก!)
      .updateMany(
        { duration_minute: "Unknown" }, // ยังใช้ string ได้
        { $set: { duration_minute: null } }
      );

    console.log(`🎉 Updated ${result.modifiedCount} movie(s) with 'Unknown' duration.`);
  } catch (error) {
    console.error('❌ Error fixing duration_minute:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixUnknownDuration();
