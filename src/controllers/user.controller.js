const { request, response } = require('express')
const path = require('path')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const { check, validationResult} = require('express-validator')
const multer = require('multer')
const { nanoid } = require('nanoid')


const multerConfig = {
    // A multer error that it can be handle with multer.Error instance
    limits: {fileSize: 400_000},
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, path.join(__dirname, '../../public/uploads/'))
        },
        filename(req, file, cb) {
            cb(null, `${ nanoid(10) }.${ file.mimetype.split('/')[1] }`)
        }
    }),
    fileFilter(req, file, cb) {
        const mimeTypesArr = ['image/jpeg', 'image/jpg', '']
        if(mimeTypesArr.includes(file.mimetype)) {
            cb(null, true)
        } else if (file && !mimeTypesArr.includes(file.mimetype)) {
            cb(new Error('Multer Error Format'))
            // cb(null, false)
        } else {
            cb(new Error('Multer Error in (FILE FILTER)'))
        }
    },
}
const upload = multer(multerConfig).single('profile_picture')


const showRegister = (req=request, res=response) => {
    res.render('create-account', {
        title: 'Crea una cuenta',
        tagline: 'Comienza a publicar vacantes a partir de una cuenta gratis, sin limitaciones y sin anuncios, por favor no esperes más',
        bar: true
    })    
}

const addNewUser = async (req=request, res=response, next) => {
    const newUser = User(req.body)
    try{
        await newUser.save()
        res.redirect('/login')
    } catch (error) {
        req.flash('error', error)
        return res.render('create-account', {
            title: 'Crea una cuenta',
            tagline: 'Comienza a publicar vacantes a partir de una cuenta gratis, sin limitaciones y sin anuncios, por favor no esperes más',
            bar: true,
            messages: req.flash(),
            data: req.body,
        })    
    }
}

const expressValidator = async (req=request, res=response, next) => {
    const rules = [
        check('name', 'El nombre no puede quedar vacío').trim().notEmpty().escape(),
        check('email', 'Ingrese un correo válido').trim().isEmail().escape(),
        check('password', 'La contraseña debe especificarse').notEmpty().escape(),
        check('confirm', 'Es importante que confirmes la contraseña').notEmpty().escape(),
        check('confirm', 'Las contraseñas deben coincidir').equals(req.body.password)
    ]
    // Method run in validation means that I want to use expressValidator at this specify moment
    await Promise.all(rules.map(validation => validation.run(req)))
    

    const errors = validationResult(req)
    // Firstly, the errors have to be turned into array, because it can be other thing more.
    if(errors.array().length) {
        req.flash('errors', errors.array().map(singleError => singleError.msg))
        return res.render('create-account', {
            title: 'Crea una cuenta',
            tagline: 'Comienza a publicar vacantes a partir de una cuenta gratis, sin limitaciones y sin anuncios, por favor no esperes más',
            bar: true,
            messages: req.flash(),
            data: req.body
        })    
    }
    // If everyting goes well I want to continue
    next()
}

const showLogin = (req=request, res=response, next) => {
    res.render('login', {
        title: 'Login'
    })
}

const showEditProfile = (req=request, res=response) => {
    // const person = handlebars.template({name: 'asd', email: 'asd@ad.com'})
    res.render('edit-profile',{
        title: 'Edit profile: ' + req.user.name,
        person: req.user,
        logout: true,
        userName: req.user.name,
        profilePicture: req.user.profile_picture,
    })
}

const goEditProfile = async (req=request, res=response) => {
    const uniqUser = await User.findById(req.user._id) 
    uniqUser.name = req.body.name
    uniqUser.email = req.body.email
    if(req.body.password) {
        uniqUser.password = req.body.password
    }

    if(req.file) {
        uniqUser.profile_picture = req.file.filename
    }
 
    await uniqUser.save()
    req.flash('correcto', 'Cambios guardados correctamente')
    res.redirect('/management')
}


const uploadPictureProfile = (req=request, res=responsen, next) => {
    upload(req, res, function(err) {
        if(err instanceof multer.MulterError) {
            if(err.code === 'LIMIT_FILE_SIZE') {
                req.flash('errors', 'La imágen es demasido grande (400kb)')
                return res.redirect('/edit-profile')
            }
            res.status(500).send('Multer Error in (ELSE). Contact contacto to support',)
        } else if (err) {
            // res.status(500).send('Multer Error in (ELSE IF). Please contact to support')
            req.flash('errors', 'El formato no es permitido (jpeg, jpg, png)')
            console.log('Multer Error in (ELSE IF). Please contact to support')
            return res.redirect('/edit-profile')
        }
        next()
    })
}

const editProfileValidation = async (req=request, res=response, next) => {
    const rules = [
        check('name', 'El nombre es obligatorio').notEmpty().escape(),
        check('email', 'El correo tiene que ser válido').isEmail().escape(),
    ]

    await Promise.all(rules.map(validation => validation.run(req)))
    const errors = validationResult(req)

    // If everything goes well then continue
    if(!errors.array().length) return next()

    req.flash('errors', errors.array().map(error => error.msg))
    return res.render('edit-profile',{
        title: 'Edit profile: ' + req.user.name,
        person: req.user,
        logout: true,
        userName: req.user.name,
        profilePicture: req.user.profile_picture,
        messages: req.flash()
    })
}

const logout = (req=request, res=response) => { 
    req.logout()
    req.flash('correcto', 'Has cerrado tu sesión correctamente')
    return res.redirect('/login')
}

module.exports = {
    showRegister,
    addNewUser,
    expressValidator,
    showLogin,
    showEditProfile,
    goEditProfile,
    logout,
    editProfileValidation,
    uploadPictureProfile
}