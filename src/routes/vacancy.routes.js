const { Router } = require('express')
const router = Router()
const vacancyController = require('../controllers/vacancy.controller')
const { isAuthenticate } = require('../controllers/auth.controller')

router.get('/', 
    vacancyController.vacanciesList
)

router.get('/vacancies/new', 
    isAuthenticate,
    vacancyController.newVacancy
)
router.post('/vacancies/new', 
    // isAuthenticate, 
    vacancyController.newVacancyValidation,
    vacancyController.addVacancy
)

router.get('/vacancies/:url', 
    vacancyController.showSingleVacancy
)

router.get('/vacancies/edit/:url', 
    isAuthenticate,
    vacancyController.showEditVacancy
)

router.post('/vacancies/edit/:url', 
    isAuthenticate,
    vacancyController.newVacancyValidation,
    vacancyController.goEditVacancy
)

router.delete('/vacancies/delete/:id', 
    isAuthenticate,
    vacancyController.deleteVacancy
)

router.post('/vacancies/candidates/:url', 
    vacancyController.uploadCV,
    vacancyController.addCandidate
)

router.get('/candidates/:url',
    isAuthenticate,
    vacancyController.vacanciesByCadidates
)

router.post('/vacancies/search', 
    vacancyController.searchVacancies
)
module.exports = router