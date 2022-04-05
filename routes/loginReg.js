var express = require('express');
var router = express.Router();
var {client, dbName} = require('../db/mongo');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var bcrypt = require('bcrypt');
let {validarUser} = require('./schemas');
var ObjectId = require('mongodb').ObjectId

passport.use(new LocalStrategy(
  async function(username, password, done) {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('usuarios');
    var usuario = await collection.findOne({ email: username })
    if (!usuario) {return done(null, false);}

    var comparar = await bcrypt.compare(password,usuario.pass)
    if(!comparar){
      console.log("Error al poner la contraseña")
      return done(null, false);
    } else {
      return done(null, usuario);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

router.get('/', function(req, res, next) {
    res.render('login/loginReg', { titP: 'Inicio de Sesión y Registro',
    titH: 'Lorem.net - Login/Register',
    descripP: 'Mayor personalización a tu alcance', 
    imgP: 'imgP_login' });
});
  
router.post('/register', function(req, res, next){
    regUser(req.body)
    .then(async function(){
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection('usuarios');
      let usuario = await collection.findOne({email: req.body.emailUser});
      var user = {
        _id: ObjectId(usuario._id),
        username: usuario.email
      };
      req.login(user, function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    })
    .catch((err)=>{
        console.log(err);
        res.redirect('/login')
    })
    .finally(()=>{
        client.close();
    })
});

router.post('/entrar',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    if(req.user.profile==="admin"){
      res.redirect('/admin/cotizaciones')
    }else{
      res.redirect('/');
    }
  });

router.get('/editar', function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }}, function(req, res, next) {
    res.render('login/editarUsuario', { titP: 'Ajustes del Usuario',
    titH: 'Lorem.net - Ajustes',
    descripP: 'Mayor personalización a tu alcance', 
    imgP: 'imgP_login',
    session: req.user});
});

router.post('/editar', function(req, res, next){
  editUser(req.body)
  .then(()=>{
    res.redirect('/')
  })
  .catch((err)=>{
    console.log(err);
  })
  .finally(()=>{
    client.close();
  })
})

router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

async function regUser(datos){
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('usuarios');
  var response = await collection.findOne({ email: datos.emailUser })
  if (response) {
    console.log('Ya existe un usuario con ese correo')
    throw false
  }else{
    if (datos.passUser !== datos.confPass) {
      throw false
    } else {
      var respuesta = validarUser(datos)
      if(respuesta.error){
        console.log(respuesta.error.details);
        throw false
      }else{
        var hashpass = await bcrypt.hash(datos.passUser,10);
  
        await collection.insertOne({
            nomUser: datos.nomUser,
            apUser: datos.apUser,
            email: datos.emailUser,
            pass: hashpass,
            cel: datos.celUser,
            ciudad: datos.ciudadUser,
            profile: "user"
        });
      }
    }
  }  
}

async function editUser(datos){
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('usuarios');
  
  if(!datos.passEdit){
    await collection.updateOne({ email: datos.emailEdit },
      {$set:
        {nomUser: datos.nomUser,
          apUser: datos.apUser,
          cel: datos.celUser,
          ciudad: datos.ciudadUser}
      }
    )
  } else {
    if(!datos.confPassEdit && datos.passEdit){
      throw false
    }
  
    var usuario = await collection.findOne({email: datos.emailEdit})
    var respuesta = await bcrypt.compare(datos.confPassEdit, usuario.pass);

    if (!respuesta) {
      console.log(respuesta)
      throw false
    } else {
      var hashpass = await bcrypt.hash(datos.passEdit,10);
      await collection.updateOne({ email: datos.emailEdit },
        {$set:
          {nomUser: datos.nomUser,
          apUser: datos.apUser,
          pass: hashpass,
          cel: datos.celUser,
          ciudad: datos.ciudadUser}
        }
      ) 
    }
  }
};

module.exports = router;