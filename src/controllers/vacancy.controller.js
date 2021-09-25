const { request, response } = require('express');
const path = require('path')
const { nanoid } = require('nanoid')
const mongoose = require('mongoose');
const Vacancy = mongoose.model('Vacancy');
const { check, validationResult } = require('express-validator');
const createError = require('http-errors')
const multer = require('multer')
const multerConfig = {
	limits: {fileSize: 100_000},
	storage: multer.diskStorage({
		destination: (req=request, file, cb) => {
			cb(null, path.join(__dirname,'../../public/uploads/cvs'))
		},
		filename: (req=request, file, cb) => {
			cb(null, nanoid(10) + '.' + file.mimetype.split('/')[1])
		}
	}),
	fileFilter(req=request, file, cb) {
		const mimeTypesArr = ['application/pdf']
		if(mimeTypesArr.includes(file.mimetype)) {
			cb(null, true)
		} else if (!mimeTypesArr.includes(file.mimetype)) {
			cb(new Error('Multer Error Format'))
		} else {
			cb(new Error('Multer Error in (FILE FILTER)'))
		}
	}
}
const upload = multer(multerConfig).single('cv')

const vacanciesList = async (req = request, res = response) => {
	const vacancies = await Vacancy.find().lean();

	res.render('home', {
		title: 'DevJobs',
		tagline: 'Encuentra y publica trabajos para programadores web',
		bar: true,
		button: true,
		vacancies,
	});
};

const newVacancy = (req = request, res = response) => {
	res.render('new-vacancy', {
		title: 'Nueva Vacante',
		tagline: 'Llena el formulario y publica tu vacante',
		logout: true,
		userName: req.user.name,
		profilePicture: req.user.profile_picture,
	});
};

const newVacancyValidation = async (req = request, res = response, next) => {
	const rules = [
		check('title', 'Ingresa un titulo de vacante').notEmpty().escape(),
		check('company', 'El nombre de la compañia no pueder esta vacío')
			.notEmpty()
			.escape(),
		check('location', 'Añade el tipo de localización').notEmpty().escape(),
		check('contract', 'Defina un tipo de contrato').notEmpty().escape(),
		check('description', 'Es importante añadir una descripción')
			.notEmpty(),
		check('skills', 'Al menos selecciona una habilidad')
			.notEmpty()
			.escape(),
	];
    await Promise.all(rules.map((validation) => validation.run(req)))
	const errors = validationResult(req)
    if(!errors.array().length) return next()

    req.flash('errors', errors.array().map(error => error.msg))

    // Turn skills into array for handle in the handlebars helper
    const newSkills = req.body.skills.split(',')
    req.body.skills = newSkills

    res.render('new-vacancy', {
		title: 'Nueva Vacante',
		tagline: 'Llena el formulario y publica tu vacante',
		logout: true,
		userName: req.user.name,
		profilePicture: req.user.profile_picture,
        messages: req.flash(),
        vacancy: req.body
	});
};


const addVacancy = async (req = request, res = response) => {
	const newVacancy = Vacancy(req.body);
	newVacancy.author =  req.user._id;
	// newVacancy.author =  req.headers.id
	// Push an array to the database
	newVacancy.skills = req.body.skills.split(',');
	await newVacancy.save();
	res.redirect(`/vacancies/${newVacancy.url}`);
};

const showSingleVacancy = async (req = request, res = response, next) => {
	const uniqueVacancy = await Vacancy.findOne({ url: req.params.url }).populate('author').lean();
	if (!uniqueVacancy) return next();

	res.render('single-vacancy', {
		title: uniqueVacancy.title,
		bar: true,
		uniqueVacancy,
	});
};

const showEditVacancy = async (req = request, res = response, next) => {
	const uniqueVacancy = await Vacancy.findOne({ url: req.params.url }).lean();
	if (!uniqueVacancy) return next();

	res.render('edit-vacancy', {
		title: `Edit - ${uniqueVacancy.title}`,
		uniqueVacancy,
		logout: true,
		userName: req.user.name,
		profilePicture: req.user.profile_picture,
	});
};

const goEditVacancy = async (req = request, res = response) => {
	const currentVacancy = req.body;
    
	currentVacancy.skills = req.body.skills.split(',');
	try {
		await Vacancy.findOneAndUpdate({ url: req.params.url }, currentVacancy);
	} catch (error) {
		console.log(error);
	}

	res.redirect(`/vacancies/${req.params.url}`);
};

const deleteVacancy = async (req=request, res=response) => {
	const { id } = req.params
	const vacancy = await Vacancy.findById({_id: id})
	if(checkAuthor(vacancy, req.user)) {
		vacancy.remove()
		return res.sendStatus(200)
	} else {
		return res.sendStatus(403)
	}

	
}

const checkAuthor = (vacancy = {}, user = {}) => {
	if(vacancy.author.equals(user._id)) {
		return true
	} else {
		return false
	}
}

const uploadCV = (req=request, res=response, next) => {
	upload(req, res, (err) => {
		if(err instanceof multer.MulterError) {
			if(err.code === 'LIMIT_FILE_SIZE') {
				req.flash('errors', 'El archivo es demasido grande (100kb)')
				return res.redirect('back')
			}
			return res.status.send('Multer Error in (MulterError Instance).. Contact to support')
		} else if (err) {
			req.flash('errors', 'El formato no es permitido (pdf)')
			console.log(err.message)
			return res.redirect('back')
			// ! Corregir esto, es para no tener que estar escriendo archivos
			// return next()
		}
		if(!req.file) {
			req.flash('errors', 'Tienes que adjuntar tu currículo')
			return res.redirect('back')
		}
		next()
	})
}

const addCandidate = async (req=request, res=response) => {
	req.flash('correcto', 'Se ha enviado tu candidatura correctamente')
	const url = req.params.url
	const uniqVacancy = await Vacancy.findOne({ url: url})
	const newCandidate = {
		name: req.body.name,
		email: req.body.email,
		cv: req.file.filename
	}
	uniqVacancy.candidates.push(newCandidate)
	uniqVacancy.save()
	res.redirect('back')
}

const vacanciesByCadidates = async (req=request, res=response, next) => {
	const uniqVacancy = await Vacancy.findOne({url: req.params.url})
	if(!uniqVacancy) {
		return next()
	}

	// if(!req.user) return next(createError(403, 'No tienes permisos'))
	if(!req.user) return res.send('You cannot see the candidates without access permissions')
	if(req.user._id.toString() != uniqVacancy.author) return res.send('$USER have no access permissions for candidates')
	
	res.render('candidates-list', {
		title: `Lista de candidatos - ${uniqVacancy.title}`,
		logout: true,
		userName: req.user.name,
		profilePicture: req.user.profile_picture,
		candidates: uniqVacancy.candidates
	})
}

const searchVacancies = async (req=request, res=response, next) => {
	const vacancies = await Vacancy.find({
		$text: {
			$search: req.body.query
		}
	})
	res.render('home', {
		title: 'DevJobs',
		tagline: 'Encuentra y publica trabajos para programadores web',
		bar: true,
		button: true,
		vacancies,
	});
}

module.exports = {
	newVacancy,
	addVacancy,
	showSingleVacancy,
	showEditVacancy,
	goEditVacancy,
	vacanciesList,
	newVacancyValidation,
	deleteVacancy,
	uploadCV,
	addCandidate,
	vacanciesByCadidates,
	searchVacancies
};
