require('dotenv').config({ path: '.env'})
require('./src/config/db-connection')

const express = require('express')
const port = process.env.PORT || 1010
const app = express()
const exphbs = require('express-handlebars')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const myPassport = require('./src/config/passport')
const Handlebars = require('handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

// VIEW ENGINE
app.engine('handlebars', exphbs({
    helpers: require('./src/helpers/handlebars'),
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}))
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, './src/views'))

// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')))

// MIDDLEWARES
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// TODO: MongoDB session
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}))
app.use(flash())
app.use(myPassport.initialize())
app.use(myPassport.session())

app.use((req=request, res=response, next) => {
    res.locals.messages = req.flash()
    res.locals.brandName = ' | DevJobs'
    next()
})

// ROUTES
app.use('/', require('./src/routes/vacancy.routes'))
app.use('/', require('./src/routes/management.routes'))
app.use('/', require('./src/routes/user.routes'))
// app.use((error, req, res) => {
//     console.log(error.message)
//     console.log(error.status)
//     res.status(error.status)
//     res.send(error.status, 'ERROR')
// })
app.listen(port, () => {
    console.log('Listening at port', port);
})