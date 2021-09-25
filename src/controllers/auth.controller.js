const { request, response } = require('express')
const passport = require('passport')

// Check if login is valid and redirect
// const goAuthenticate = passport.authenticate('local', {
//     failureRedirect: '/login',
//     successRedirect: '/management',
//     failureFlash: true,
//     badRequestMessage: 'Los campos son obligatorios',

// })

// I want to preserve the user email after the error
const goAuthenticate = (req=request, res=response, next) => {
    passport.authenticate('local', (err, user ,info) => {
        if(err) return next(err)
        if(!user) {
            let errorMessage = info.message.toLowerCase() === 'missing credentials' ? 'Los campos son obligatorios' : info.message
            req.flash('errors', errorMessage)
            req.flash('userEmail', info.email)
            return res.redirect('/login')
        }
        req.logIn(user, (err) => {
            if(err) return next(err)
            return res.redirect('/management')
        })
    })(req, res, next)
}

// Protect the URL's
const isAuthenticate = (req=request, res=response, next) => {
    if(req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

module.exports = {
    goAuthenticate,
    isAuthenticate
}