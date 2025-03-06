const express = require('express')
const app = express()
const mongoose = require('mongoose')
const expressSession = require('express-session')
const flash = require('connect-flash')

//connection MongoDb
mongoose.connect('mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

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
app.use(express.urlencoded())
app.use(flash())
app.use(expressSession({secret: "node secret"}))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/home', indexController)
app.get('/login', loginController)
app.get('/register', registerController)
app.post('/user/register', storeUserController)
app.get('/movie-detail', moviedetailController)
app.get('/user-profile', userprofileController)
app.get('/home-new', homenewController)
app.get('/result-search', resultsearchController)
app.get('/all-content', allcontentController)
app.get('/', indexController)


app.listen(4000,() => {
    console.log('Server is running on port 4000')

})