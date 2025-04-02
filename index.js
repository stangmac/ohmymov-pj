require('dotenv').config();

const { requireLogin } = require('./middleware/auth');
const { searchMovies } = require('./controllers/searchController');
const { exec } = require('child_process');

const express = require('express');
const router = express.Router();
const { logUserActivity } = require('./controllers/userActivityController');
const app = express();
const mongoose = require('mongoose');
const expressSession = require('express-session');
const bodyParser = require("body-parser");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const authMiddleware = require('./middleware/auth');
// เชื่อมต่อกับ MongoDB Atlas
const dbUrl = 'mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/ohmymov';

mongoose.connect(dbUrl)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

global.loggedIN = null;

// Controller
const indexController = require('./controllers/indexController');
const loginController = require('./controllers/loginController');
const registerController = require('./controllers/registerController');
const storeUserController = require('./controllers/storeUserController');
const moviedetailController = require('./controllers/moviedetailController');
const userprofileController = require('./controllers/user-profileController');
const homenewController = require('./controllers/homenewController');
const resultsearchController = require('./controllers/resultsearchController');
const allcontentController = require('./controllers/allcontentController');
const loginUserController = require('./controllers/loginUserController');
const forgotPasswordController = require('./controllers/forgotPasswordController');
const verifyOTPController = require('./controllers/verifyOTPController');
const resetPasswordController = require('./controllers/resetPasswordController');
const searchController = require('./controllers/searchController'); // Add searchController
const updateProfileController = require("./controllers/updateProfileController");
const changePasswordController = require("./controllers/changePasswordController");
const suggestionController = require("./controllers/suggestionController");







app.use(express.static('public'));
app.use(express.static('asset'));
// Middleware สำหรับอ่าน JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Import Controller








// const authMiddleware = require('../middleware/auth'); // Import authentication middleware








app.use(flash());
app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: dbUrl }),
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }
}));

app.use((req, res, next) => {
    console.log("Session User:", req.session.user);
    res.locals.loggedIN = req.session.user ? req.session.user.username : null;
    next();
});

// Routes
app.get('/check-login', (req, res) => {
    res.json({ loggedIn: !!req.session.user });
});

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', indexController);
app.get('/login', loginController);
app.post('/login', loginUserController);
app.get('/register', registerController);
app.post('/register', storeUserController);
app.get('/movie-detail', moviedetailController);
app.get('/user-profile', userprofileController);
app.get('/home-new', homenewController);
app.get('/result-search', resultsearchController);
app.get('/all-content', allcontentController);
app.get('/suggestion', suggestionController);
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.locals.loggedIN = null;
        res.redirect('/');
    });
});

app.get('/forgot-password', (req, res) => res.render('forgot-password', { error: null }));
app.post('/forgot-password', forgotPasswordController);
app.get('/verify-otp', (req, res) => res.render('verify-otp', { email: "", error: null }));
app.post('/verify-otp', verifyOTPController);
app.get('/reset-password', (req, res) => res.render('reset-password', { email: "", error: null }));
app.post('/reset-password', resetPasswordController);
// edit profile

app.post('/update-profile', updateProfileController);
app.post('/request-otp', changePasswordController.requestOtp);
app.post('/change-password', changePasswordController.changePassword);
app.post('/log-activity', authMiddleware.requireLogin, logUserActivity);



// //keep data user
router.post('/log-activity', logUserActivity);

module.exports = router;
  


// Route สำหรับการเก็บพฤติกรรมการใช้งานของผู้ใช้
app.post('/log-activity', requireLogin, logUserActivity);



// Add search routing
app.get('/search', searchMovies);
//วิธีตั้งให้รันอัตโนมัติทุกครั้งที่เปิดเซิร์ฟเวอร์ 
// exec('node syncMoviesAuto.js', (err, stdout, stderr) => {
//     if (err) {
//         console.error('❌ Error Running syncMoviesAuto.js:', err);
//         return;
//     }
//     console.log(stdout);
// });

// API ตรวจสอบสถานะการเข้าสู่ระบบ
app.get('/check-login', (req, res) => {
    console.log("Session User:", req.session.user);
    res.json({ loggedIn: !!req.session.user });
});

// Middleware สำหรับป้องกันหน้าที่ต้อง login
app.use('/protected', requireLogin, (req, res) => {
    res.send('This is a protected page');
});

// Error 404
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});