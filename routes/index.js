var express = require('express');
var router = express.Router();
var {client, dbName} = require('../db/mongo');
var passport = require('passport');
const { ObjectId } = require('mongodb');

passport.deserializeUser(async function(id, done) {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('usuarios');
  await collection.findOne({_id:ObjectId(id)}, function (err, user) {
    done(err, user);
  });
});

// PÁGINA PRINCIPAL
router.get('/', function(req, res, next) {
    res.render('index', { titP: 'LOREM.NET',
    titH: 'Lorem.net - INICIO',
    descripP: 'Tecnología de punta a tu alcance', 
    imgP: 'imgP_index',
    session: req.user});
});

// ACERCA DE NOSOTROS
router.get('/acercade', function(req, res, next) {
  res.render('nosotros', { titP: 'Sobre Nosotros',
  titH: 'Lorem.net - NOSOTROS',
  descripP: 'Conoce a tu empresa de confianza', 
  imgP: 'imgP_nosotros',
  session: req.user});
});

// CHAT
router.get('/chat', function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }}, function(req, res, next) {
  res.render('chat', { titP: 'Servicio al Cliente',
  titH: 'Lorem.net - CHAT',
  descripP: 'Comunícate con nuestros profesionales', 
  imgP: 'imgP_contacto',
  session: req.user});
});

// PÁGINA CONTACTO/COTIZACION
router.get('/contacto', function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }}, function(req, res, next) {
  res.render('contacto', { titP: '¡Habla con nosotros!',
  titH: 'Lorem.net - CONTACTO',
  descripP: 'Construyamos el futuro juntos', 
  imgP: 'imgP_contacto',
  session: req.user});
});

router.post('/contacto', function(req, res, next){
  nuevaCot(req.body)
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

// PÁGINA PREGUNTAS FRECUENTES
router.get('/faq', function(req, res, next) {
  res.render('faq', { titP: 'Preguntas Frecuentes',
  titH: 'Lorem.net - FAQ',
  descripP: 'Tenemos las respuestas que necesitas', 
  imgP: 'imgP_faq',
  session: req.user});
});

async function nuevaCot(datos){
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('cotizaciones');
  await collection.insertOne({
      nomUser: datos.nomCot,
      apUser: datos.apCot,
      email: datos.emailCot,
      cel: datos.celCot,
      ciudad: datos.ciudadCot,
      servicio: datos.servicio,
      infoExtra: datos.infoExtra
  })
}

module.exports = router;