const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const session = require('express-session');
const config = require('./config/Config');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passport.Strategy;
const jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
jwtOptions.secretOrKey = 'movieratingapplicationsecretkey';

const app = express();
const router = express.Router();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.use(session({
  secret: config.SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { httpOnly: false },
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to mongodb
mongoose.connect(config.DB, function() {
  console.log('Connection has been made');
})
.catch(err => {
  console.error(`App starting error: ${err.stack}`);
  process.exit(1);
});

// Include controllers
fs.readdirSync('controllers').forEach(file => {
  if (file.substr(-3) === '.js') {
    const route = require(`./controllers/${file}`)
    route.controller(app)
  }
})

app.use(history());
app.use(serveStatic(`${__dirname}/dist`));

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
  console.log('error! auth failed');
}

router.get('/api/current_user', isLoggedIn, (req, res) => {
  if (req.user) {
    res.send({ current_user: req.user });
  } else {
    res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

router.get('/api/logout', (req, res) => {
  req.logout();
  res.send();
})

const port = process.env.API_PORT || 8081;
app.use('/', router);
app.listen(port, function() {
  console.log(`api running on port ${port}`);
});