require('dotenv').config();

const { requireLogin } = require('./middleware/auth'); 

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const expressSession = require('express-session')
const MongoStore = require('connect-mongo');
const flash = require('connect-flash')
const router = express.Router();


// เชื่อมต่อกับ MongoDB Atlas
const dbUrl = 'mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/ohmymov';


    
mongoose.connect(dbUrl)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

global.loggedIN = null


// Controller
const indexController = require('./controllers/indexController')
const loginController = require('./controllers/loginController')
const registerController = require('./controllers/registerController')
const storeUserController = require('./controllers/storeUserController')
const moviedetailController = require('./controllers/movie-detailController')
const userprofileController = require('./controllers/user-profileController')
const homenewController = require('./controllers/homenewController')
const resultsearchController = require('./controllers/resultsearchController')
const allcontentController = require('./controllers/allcontentController')
const loginUserController = require('./controllers/loginUserController')
const forgotPasswordController = require('./controllers/forgotPasswordController');
const verifyOTPController = require('./controllers/verifyOTPController');
const resetPasswordController = require('./controllers/resetPasswordController');



app.use(express.static('public'))
app.use(express.static('asset'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(flash())
app.use(expressSession({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false, // ✅ เปลี่ยนเป็น `false` เพื่อป้องกัน session ที่ไม่ได้ใช้งาน
    store: MongoStore.create({ mongoUrl: dbUrl }), // ✅ ใช้ MongoDB เก็บ session
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 } // 1 ชั่วโมง
}));

app.use((req, res, next) => {
    console.log("Session User:", req.session.user);
    res.locals.loggedIN = req.session.user ? req.session.user.username : null;
    // ใช้  username
    next();
});


// Routes
app.get('/check-login', (req, res) => {
    res.json({ loggedIn: !!req.session.user });
});

    
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', indexController)
app.get('/login', loginController)
app.post('/login', loginUserController)  
app.get('/register', registerController)
app.post('/register', storeUserController)
app.get('/movie-detail', moviedetailController)
app.get('/user-profile', userprofileController)
app.get('/home-new', homenewController)
app.get('/result-search', resultsearchController)
app.get('/all-content', allcontentController)
app.get('/', indexController)
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.locals.loggedIN = null; // ✅ รีเซ็ตค่า
        res.redirect('/');
    });
});

app.get('/forgot-password', (req, res) => res.render('forgot-password', { error: null }));
app.post('/forgot-password', forgotPasswordController);
app.get('/verify-otp', (req, res) => res.render('verify-otp', { email: "", error: null }));
app.post('/verify-otp', verifyOTPController);
app.get('/reset-password', (req, res) => res.render('reset-password', { email: "", error: null }));
app.post('/reset-password', resetPasswordController);







// API ตรวจสอบสถานะการเข้าสู่ระบบ
app.get('/check-login', (req, res) => {
    console.log("Session User:", req.session.user); // ตรวจสอบ session
    res.json({ loggedIn: !!req.session.user });
});


// Middleware สำหรับป้องกันหน้าที่ต้อง login
app.use('/protected', requireLogin, (req, res) => {
    res.send('This is a protected page');
});







// Error 404
app.listen(3000,() => {
    console.log('Server is running on port 3000')

})