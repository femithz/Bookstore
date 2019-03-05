var createError = require('http-errors');
var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose=require('mongoose');
require('dotenv').config()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// passport
var passport=require('passport');
var session=require('express-session');
var MongoStore=require('connect-mongo')(session);
app.use(session({
  name:'mysid',
  resave:false,
  saveUninitialized:false,
  secret:'secret',
  cookie:{
    maxAge:36000000,
    // httpOnly:false,
    secure:false
  },
   store:new MongoStore({
     mongooseConnection:mongoose.connection,
     clear_interval: 3600
     })
}));
app.use(passport.initialize());
app.use(passport.session());
require('./passport-config');

app.use('/', indexRouter);
app.use('/users', usersRouter);
mongoose.connect('mongodb://localhost/Bookstore');


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

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
