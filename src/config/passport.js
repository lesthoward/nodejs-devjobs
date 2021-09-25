const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { model } = require('mongoose');
const User = model('User');

const passportConfig = passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async (email, password, done) => {
			const user = await User.findOne({ email });
			if (!user)
				return done(null, false, {
					message: 'Primero tienes que registrarte',
					email
				});

			if (!user.checkPassword(password))
				return done(null, false, { message: 'Contraseña incorrecta', email});

			return done(null, user);
		}
	)
);

passportConfig.serializeUser((user, done) => {
    done(null, user.id)
})

passportConfig.deserializeUser(async (userID, done) => {
    const userFound = await User.findOne({_id: userID})
    done(null, userFound)
})

module.exports = passportConfig;
