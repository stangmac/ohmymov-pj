const express = require('express')
const app = express()
const mongoose = require('mongoose')
const expressSession = require('express-session')
const flash = require('connect-flash')

// เชื่อมต่อกับ MongoDB Atlas
const dbUrl = 'mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/';

mongoose.connect(dbUrl)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

    
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

app.use(express.static('public'))
app.use(express.static('asset'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(flash())
app.use(expressSession({secret: 'your_secret_key',
    resave: false,             
    saveUninitialized: false  }))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/home', indexController)
app.get('/login', loginController)
app.get('/register', registerController)
app.post('/register', storeUserController)
app.get('/movie-detail', moviedetailController)
app.get('/user-profile', userprofileController)
app.get('/home-new', homenewController)
app.get('/result-search', resultsearchController)
app.get('/all-content', allcontentController)
app.get('/', indexController)


app.listen(3000,() => {
    console.log('Server is running on port 3000')

})