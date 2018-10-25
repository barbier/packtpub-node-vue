const User = require('../models/User');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports.controller = app => {
    // Local Strategy
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, (email, password, done) => {
        User.getUserByEmail(email, (err, user) => {
            
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            User.comparePassword(password, user.password, (error, isMatch) => {
                if (isMatch) {
                    return done(null, user);
                }
                return done(null, false);
            });
            return true;
        });
    }));

    // User Login
    app.post('/users/login',
        passport.authenticate('local', {
            failureRedirect: 'users/login',
        }),
        (req, res) => {
            res.redirect('/');
        }
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    // User Register
    app.post('/users/register', (req, res) => {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const newUser = new User({
            name,
            email,
            password,
        });

        User.createUser(newUser, (error, user) => {
            if (error) {
                res.status(422).json({
                    message:'Something went wrong. Please try again after some time!',
                })
            }
            res.send({ user });
        });
    });
};