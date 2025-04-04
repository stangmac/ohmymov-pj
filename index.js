require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require("body-parser");
const flash = require('connect-flash');
const { exec } = require('child_process');

// 🔐 Middleware
const { requireLogin } = require('./middleware/auth');

// 🌐 MongoDB Atlas
const dbUrl = 'mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/ohmymov';

mongoose.connect(dbUrl)
    .then(() => console.log('✅ Connected to MongoDB!'))
    .catch((err) => console.error('❌ Error connecting to MongoDB:', err));

// 📦 Middleware
app.use(express.static('public'));
app.use(express.static('asset'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: dbUrl }),
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }
}));

// 📌 ตั้งค่าผู้ใช้เข้าสู่ระบบ
global.loggedIN = null;
app.use((req, res, next) => {
    res.locals.loggedIN = req.session.user ? req.session.user.username : null;
    global.loggedIN = req.session.user ? req.session.user._id : null;
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

// ✅ 🔍 Search Routes
app.get('/search', searchController.searchMovies); // สำหรับ autocomplete (JSON)
app.get('/result-search', searchController.renderSearchPage); // สำหรับหน้าแสดงผลเต็มแบบมี % Matching

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.locals.loggedIN = null;
        res.redirect('/');
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

// ✅ เก็บกิจกรรมผู้ใช้ (like, seen, etc.)
app.post('/log-activity', requireLogin, logUserActivity);

// 🔐 ตรวจสอบ login
app.get('/check-login', (req, res) => {
    res.json({ loggedIn: !!req.session.user });
});

// 🔐 Protected test
app.use('/protected', requireLogin, (req, res) => {
    res.send('This is a protected page');
});

// 🚀 Auto sync movie data (optional)
// exec('node syncMoviesAuto.js', (err, stdout, stderr) => {
//     if (err) return console.error('❌ Error Running syncMoviesAuto.js:', err);
//     console.log(stdout);
// });

// 🎬 Start Server
app.listen(3000, () => {
    console.log('🎥 Server is running on http://localhost:3000');
});
