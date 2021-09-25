const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        lowercase: true,
        trim: true,
        require: true
    },
    password: {
        type: String,
        require: true,
        trim: true,

    },
    token: String,
    tokenExpiredDate: Date,
    profile_picture: String
})

userSchema.pre('save', async function(next) {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(this.password, salt)
    if(!this.isModified('password')) return next()

    this.password = hash
    next()
})

userSchema.post('save', function(error, doc, next) {
    if(error.name === 'MongoServerError' && error.code === 11000) {
        next('El correo ya se encuentra registrado')
    } else {
        next(error)
    }
})

userSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
