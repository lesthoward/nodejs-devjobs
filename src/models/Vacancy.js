const mongoose = require('mongoose')
const { nanoid } = require('nanoid')
const slug = require('slug')
const vacancySchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'Es necesario definir un nombre de vacante',
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true,
        required: 'Coloca una localización para la vacante'
    },
    salary: {
        type: String,
        default: 0
    }, 
    contract: {
        type: String
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String
    },
    skills: [String],
    candidates: [{
        name: String,
        email: String,
        cv: String
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: 'Foreign key is a must'
    }
})

vacancySchema.pre('save', function(next) {
    const customUrl = slug(this.title)  
    this.url = `${customUrl}-${nanoid()}`
    
    next()
})

vacancySchema.index({ title: 'text' })

module.exports = mongoose.model('Vacancy', vacancySchema)