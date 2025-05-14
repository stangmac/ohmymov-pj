require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const { exec } = require('child_process');

// 🔐 Middleware
const { requireLogin } = require('./middleware/auth');

// 🌐 MongoDB Atlas
const dbUrl = process.env.MONGO_URL;

mongoose.connect(dbUrl)
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch((err) => console.error('❌ Error connecting to MongoDB:', err));

// 📦 Middleware
app.use(express.static('public'));
app.use(express.static('asset'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(flash());

app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: dbUrl }),
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }
}));

// 📌 ตั้งค่าผู้ใช้เข้าสู่ระบบ (ใช้ global.loggedIN)
global.loggedIN = null;

app.use((req, res, next) => {
  global.loggedIN = req.session.user ? req.session.user.username : null;
  console.log("Session User:", req.session.user);
  next();
});

// 🖼️ Template Engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// 📂 Controllers
const indexController = require('./controllers/indexController');
const loginController = require('./controllers/loginController');
const registerController = require('./controllers/registerController');
const storeUserController = require('./controllers/storeUserController');
const moviedetailController = require('./controllers/moviedetailController');
const userprofileController = require('./controllers/user-profileController');
const homenewController = require('./controllers/homenewController');
const allcontentController = require('./controllers/allcontentController');
const loginUserController = require('./controllers/loginUserController');
const forgotPasswordController = require('./controllers/forgotPasswordController');
const verifyOTPController = require('./controllers/verifyOTPController');
const resetPasswordController = require('./controllers/resetPasswordController');
const searchController = require('./controllers/searchController');
const updateProfileController = require("./controllers/updateProfileController");
const changePasswordController = require("./controllers/changePasswordController");
const suggestionController = require("./controllers/suggestionController");
const { logUserActivity } = require('./controllers/userActivityController');
const startController = require("./controllers/startController");
const startGenreController = require('./controllers/startGenreController');
const moviePreferenceController = require('./controllers/moviePreferenceController');
const { logFavActivity } = require('./controllers/userActivityFavController');

// const userActivityRoute = require('./routes/userActivity');
// app.use('/', userActivityRoute);
app.use(startGenreController);
// 🛣️ Routes
app.get('/', indexController);
app.get('/login', loginController);
app.post('/login', loginUserController);
app.get('/register', registerController);
app.post('/register', storeUserController);
app.get('/movie-detail', moviedetailController);
app.get('/user-profile', userprofileController);
app.get('/home-new', homenewController);
app.get('/all-content', allcontentController);
app.get('/suggestion', suggestionController);
app.get('/movie-preference', moviePreferenceController);

// ✅ 🔍 Search Routes
app.get('/search', searchController.searchMovies);
app.get('/result-search', searchController.renderSearchPage);

// 🔐 Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    global.loggedIN = null;
    res.redirect('/login');
  });
});

// 🔐 Forgot / Reset Password
app.get('/forgot-password', (req, res) => res.render('forgot-password', { error: null }));
app.post('/forgot-password', forgotPasswordController);
app.get('/verify-otp', (req, res) => res.render('verify-otp', { email: "", error: null }));
app.post('/verify-otp', verifyOTPController);
app.get('/reset-password', (req, res) => res.render('reset-password', { email: "", error: null }));
app.post('/reset-password', resetPasswordController);

// 👤 Profile
app.post('/update-profile', updateProfileController);
app.post('/request-otp', changePasswordController.requestOtp);
app.post('/change-password', changePasswordController.changePassword);

// ✅ User Activity
app.post('/log-activity', requireLogin, logUserActivity);

// // 🎬 Start step
app.post('/start', startController);
app.post('/user-activity/fav', logFavActivity);


// 🔐 Check login (used by frontend JS)
app.get('/check-login', (req, res) => {
  res.json({ loggedIn: !!req.session.user });
});

// 🔐 Protected test
app.use('/protected', requireLogin, (req, res) => {
  res.send('This is a protected page');
});

// ❌ 404 Handler
app.use((req, res, next) => {
  res.status(404).render('404', { message: "Page not found" });
});

// 🚨 Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.stack);
  res.status(500).render('500', { message: "Internal server error" });
});

// 🎬 Start Server
app.listen(3000, () => {
  console.log('🎥 Server is running on http://localhost:3000');
});
