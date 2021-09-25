const { request, response } = require('express')
const Vacancy = require('../models/Vacancy')


const showPanel = async (req=request, res=response) => {
    const vacancies = await Vacancy.find({author: req.user._id}).lean()
    res.render('panel', {
        title: 'Panel de administración',
        tagline: 'Crea y administra las vacantes desde aquí',
        logout: true,
        userName: req.user.name,
        profilePicture: req.user.profile_picture,
        vacancies
    })
}

module.exports = {
    showPanel
}