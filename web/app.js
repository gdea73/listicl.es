const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const SessionSecret = require('./.private/sessionSecret');
// required for MongoDB
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MONGO_DB_URI = 'mongodb://localhost:27017/listicles';

const SESSION_TTL_SEC = 7 * 24 * 60 * 60; /* one week in seconds */

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');

var app = express();

// in a production environment, force HTTPS (this will not preserve a port in the original URL)
if (app.get('env') === 'production')
{
	app.use((req, res, next) => {
		var protocol = req.get('x-forwarded-proto');
		protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
	});
}

// use mongoose to connect to MongoDB
const mongoDB = process.env.MONGO_DB_URI || MONGO_DB_URI;
mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// reuse the MongoDB connection established above for session data
app.use(session({
	name: 'listicles.sid',
	secret: SessionSecret.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	ttl: SESSION_TTL_SEC,
	store: new MongoStore({mongooseConnection: mongoose.connection}),
	cookie: {
		httpOnly: true,
		maxAge: 1000 * SESSION_TTL_SEC,
	},
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(require('helmet')());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
