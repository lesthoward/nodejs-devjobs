const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connection has been successfully established'))
.catch((error) => console.log('Unable to connect to the database', error))


// MODELS AND DATABASE
// Having the files below here makes vscode slow
require('../models/Vacancy')
require('../models/User')