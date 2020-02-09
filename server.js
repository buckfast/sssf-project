'use strict';
const express = require('express');
const dotenv = require('dotenv').config();
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors')
const sassMiddleware = require('node-sass-middleware');

const index = require('./routes/index');
const users = require('./routes/users');
const game = require('./routes/game');
const stats = require('./routes/stats');


const apiUsers = require('./routes/apiUsers');



const requestedPath = require("./middlewares/path");
const timestamp = require("./middlewares/timestamp");
const ip = require("./middlewares/ip");
const browser = require("./middlewares/browser");

const helmet = require('helmet');

const mongoose = require('mongoose');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");



const app = express();

app.use(cors());
app.use(helmet());


//var mongoDB = 'mongodb://127.0.0.1/assignment';
//mongoose.connect('mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+process.env.DB_HOST+':'+'27017/project');
const mongoUrl = process.env.MONGODB_URI;
mongoose.connect(mongoUrl, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb error:'));


//session
const sess = session({
  resave: false,
  saveUninitialized: true,
  secret: "suppersready"
})
app.use(
  sess
);



//passport
let User = require('./models/user');
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((userId, done) => {
  User.findById(userId, (err, user) => done(err, user));
});

const local = new LocalStrategy((username, password, done) => {
  User.findOne({ username })
    .then((user) => {
      if (!user || !user.validPassword(password, user.passwordHash)) {
        done(null, false, { message: "Invalid credentials" });
      } else {
        done(null, user);
      }
    })
    .catch((e) => done(e));
});
passport.use("local", local);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));

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
  sourceMap: false
}));


app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/', index);
app.use('/users', users);
app.use('/play', game);
app.use('/stats', stats);


app.use('/api/users', apiUsers);



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

//const http = require('http').Server(app);

const server = require('http').createServer(app);
//const io      = require('socket.io').listen(server);

const io = require('./sockets').listen(server, sess);

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log('server started');
});
