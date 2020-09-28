const path = require('path')
const express = require('express')
const hbs = require('hbs')
const passport = require('passport')
const session = require('express-session')
require('./db/mongoose')
const User = require('./models/user')
const {authentication, secureAuthentication} = require('./authentication/auth')

const app = express()

app.use(express.static('./public'))
app.set('view engine', 'hbs')
app.set('views', './public/templates/views')
hbs.registerPartials('./public/templates/partials')

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.header('Expires', '-1')
    res.header('Pragma', 'no-cache')
    next()
})

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', function(req, res) {
    res.render('index.hbs', {
        title: 'Login | Register'
    })
})

app.post('/register', async function(req, res) {
    try {
        const user = new User(req.body)
        await user.save()
        res.redirect('/')
    } catch (error) {
        res.redirect('/')
        console.log(error)
    }
})

app.post('/login', async function(req, res, next) {
    await passport.authenticate('local', {
      successRedirect: '/profile',
      failureRedirect: '/'
    })(req, res, next)
  })

app.get('/profile', secureAuthentication, function(req, res) {
    res.render('profile.hbs', {
        title: 'Profile',
        user: req.user
    })
})

app.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
})

app.get('/users', secureAuthentication, async function(req, res) {
    try {
        const users = await User.find()
        res.render('users.hbs', {
            title: 'Users',
            users: users
        })
    } catch(error) {
        throw new Error()
    }
})

app.get('*', function(req, res) {
    res.send('404 Not found')
})

const port = process.env.PORT || 3000
app.listen(port, function() {
    console.log('Server started on port ' + port)
})