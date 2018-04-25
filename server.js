'use strict';
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');

const index = require('./routes/index');
const users = require('./routes/users');
const game = require('./routes/game');

const requestedPath = require("./middlewares/path");
const timestamp = require("./middlewares/timestamp");
const ip = require("./middlewares/ip");
const browser = require("./middlewares/browser");

//TODO: global search and repalce!!!
const app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));

// create a write stream (in append mode)
//let accessLogStream = fs.createWriteStream(path.join(__dirname, 'logi.log'), {flags: 'a'})
// setup the logger
//app.use(logger('combined', {stream: accessLogStream}))


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(requestedPath);
// app.use(timestamp);
// app.use(ip);
// app.use(browser);

app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: true
}));

app.use('/', index);
app.use('/users', users);
app.use('/play', game);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const http = require('http').Server(app);
const io = require('./sockets').listen(http)

http.listen(3000, () => {
  console.log('server started');
});
