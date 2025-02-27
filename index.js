const express = require('express')
const app = express()
const mongoose = require('mongoose')
const expressSession = require('express-session')
const flash = require('connect-flash')

//connection MongoDb
mongoose.connect('mongodb+srv://admin:720272297234@cluster0.tah8c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',{useNewUrlParser:true})

// Controller
const indexController = require('./controllers/indexController')
const storeUserController = require('./controllers/storeUserController')
const loginController = require('./controllers/loginController')
const registerController = require('./controllers/registerController')

app.use(express.static('public'))
app.use(express.static('asset'))
app.use(express.json())
app.use(express.urlencoded())
app.use(flash())
app.use(expressSession({secret: "node secret"}))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', indexController)
app.get('/login', loginController)
app.get('/register', registerController)
app.post('/', storeUserController)

app.listen(4000,() => {
    console.log('Server is running on port 4000')

})