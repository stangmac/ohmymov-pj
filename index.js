const express = require('express')
const app = express()
const mongoose = require('mongoose')
const expressSession = require('express-session')
const flash = require('connect-flash')

// Controller
const indexController = require('./controllers/indexController')

app.use(express.static('public'))
app.use(express.static('asset'))
app.use(express.json())
app.use(express.urlencoded())
app.use(flash())
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', indexController)

app.listen(4000,() => {
    console.log('Server is running on port 4000')

})