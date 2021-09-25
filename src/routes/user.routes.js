const { Router } = require('express')
const userController = require('../controllers/user.controller')
const { goAuthenticate, isAuthenticate } = require('../controllers/auth.controller')
const router = Router()

// Register
router.get('/register', userController.showRegister)
router.post('/register', 
    userController.expressValidator,
    userController.addNewUser
)
// Login
router.get('/login', userController.showLogin)
router.post('/login', goAuthenticate)

router.get('/logout', 
    isAuthenticate,
    userController.logout
)

// Profile
router.get('/edit-profile', 
    isAuthenticate,
    userController.showEditProfile
)
router.post('/edit-profile', 
    isAuthenticate,
    // userController.editProfileValidation,
    userController.uploadPictureProfile,
    userController.goEditProfile,
)

module.exports = router