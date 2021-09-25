const { Router } = require('express')
const { isAuthenticate } = require('../controllers/auth.controller')
const router = Router()
const managementController = require('../controllers/management.controller')


router.get('/management', 
    isAuthenticate,
    managementController.showPanel
)

module.exports = router