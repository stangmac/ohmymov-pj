const mongoose = require('mongoose');

// ✅ ใช้ URL ตรง ไม่ใช้ .env เพื่อไม่กระทบระบบอื่น
const mongoUrl = 'mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/ohmymov';

// ✳️ เชื่อม MongoDB
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  migrate();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// 🔄 schema จากโปรเจกต์เดิม
const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  favoriteGenres: [String],
  like: [String],
  dislike: [String],
  wishlist: [String],
  seen: [String],
}, { collection: 'users' });

const userActionSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  movieId: String,
  action: String,
  timestamp: Date,
}, { collection: 'useractions' });

const User = mongoose.model('User', userSchema);
const UserAction = mongoose.model('UserAction', userActionSchema);

// 🎲 ฟังก์ชันสุ่มเวลาในอดีต
function getRandomPastTimestamp() {
  const now = new Date();
  const pastDays = Math.floor(Math.random() * 90);     // ภายใน 90 วัน
  const pastHours = Math.floor(Math.random() * 24);
  const pastMinutes = Math.floor(Math.random() * 60);
  now.setDate(now.getDate() - pastDays);
  now.setHours(now.getHours() - pastHours);
  now.setMinutes(now.getMinutes() - pastMinutes);
  return now;
}

// 🚀 ฟังก์ชัน migrate หลัก
async function migrate() {
  try {
    const users = await User.find({});
    let total = 0;

    for (const user of users) {
      const actions = [];

      const mapAction = (movieIds, actionType) => {
        (movieIds || []).forEach(movieId => {
          actions.push({
            userId: user._id,
            movieId,
            action: actionType,
            timestamp: getRandomPastTimestamp()
          });
        });
      };

      mapAction(user.like, 'like');
      mapAction(user.dislike, 'dislike');
      mapAction(user.wishlist, 'wishlist');
      mapAction(user.seen, 'seen');

      if (actions.length > 0) {
        await UserAction.insertMany(actions);
        console.log(`✅ Migrated ${actions.length} actions for user ${user._id}`);
        total += actions.length;
      }
    }

    console.log(`🎉 Migration completed: ${total} total actions migrated.`);
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    mongoose.disconnect();
  }
}
