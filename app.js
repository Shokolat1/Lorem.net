var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs')
var passport = require('passport');
var sesion = require('express-session')

var indexRouter = require('./routes/index')
var serviciosRouter = require('./routes/servicios')
var adminRouter = require('./routes/admin')
var loginRegRouter = require('./routes/loginReg');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const sessionMiddleware = sesion({ secret: 'L0r3Md07N3t', resave: true, saveUninitialized: true })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

const wrap = middleware => 
  (socket, next) => 
    middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    let user_email = socket.request.user.email
    let username = socket.request.user.nomUser
    socket.auth = { user_email };
    socket.username = username
    next();
  } else {
    next(new Error('unauthorized'))
  }
});

io.on('connection', socket => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      socketID: id,
      username: socket.request.user.nomUser,
      email: socket.request.user.email,
      type: socket.request.user.profile
    });
  }

  const session = socket.request.session;
  console.log(`saving sid ${socket.id} in session ${session.id}`);
  session.socketId = socket.id;
  session.save();
  
  socket.emit('Inicio', {
    sessionID: socket.sessionID,
    userID: socket.userID
  })
  
  socket.on('tipoUsInic', () =>{
    io.emit('traigoTipoInic', socket.request.user.profile)
  })

  socket.on('dameUsers', ()=>{
    socket.emit("users", users);
  })

  socket.on('tipoUs', () =>{
    io.emit('traigoTipo', socket.request.user.profile)
  })

  socket.on('chatMsg', msg => {
    io.emit('chatMsg', ({msg:msg, uN:socket.request.user.nomUser}));
  });

  socket.on('disconnect', ()=>{
    console.log('Usuario desconectado')
  })
})

app.use('/', indexRouter);
app.use('/servicios', serviciosRouter);
app.use('/admin', adminRouter);
app.use('/login', loginRegRouter);

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

module.exports = {app: app, server: server};