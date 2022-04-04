var express = require('express');
var router = express.Router();

// PÁGINA SERVICIOS (GENERAL)
router.get('/', function(req, res, next) {
  res.render('servicios', { titP: 'Nuestros Servicios',
  titH: 'Lorem.net - SERVICIOS',
  descripP: 'Proporcionando lo mejor para tí', 
  imgP: 'imgP_servicios',
  session: req.user});
});

// SERVICIO DE MANTENIMIENTO
router.get('/mantenimiento', function(req, res, next) {
  res.render('servicios/mantenimiento', { titP: 'Mantenimiento',
  titH: 'Lorem.net - MANTENIMIENTO',
  descripP: 'Renueva y arregla tus equipos', 
  imgP: 'imgP_mant',
  session: req.user})
});

// SERVICIO DE REDES
router.get('/redes', function(req, res, next) {
  res.render('servicios/redes', { titP: 'Redes',
  titH: 'Lorem.net - REDES',
  descripP: 'Instalaciones certificadas para TODO tipo de sistemas', 
  imgP: 'imgP_redes',
  session: req.user})
});

// SERVICIO DE SEGURIDAD
router.get('/seguridad', function(req, res, next) {
  res.render('servicios/seguridad', { titP: 'Seguridad',
  titH: 'Lorem.net - SEGURIDAD',
  descripP: 'Tus servicios al cuidado de nuestros expertos', 
  imgP: 'imgP_seguridad',
  session: req.user})
});

// SERVICIO DE SERVIDORES
router.get('/servers', function(req, res, next) {
  res.render('servicios/servers', { titP: 'Servidores',
  titH: 'Lorem.net - SERVIDORES',
  descripP: 'Cloud Computing, Hosting, Guardados en la nube, entre otros', 
  imgP: 'imgP_servers',
  session: req.user})
});

// SERVICIO DE DESARROLLO WEB
router.get('/webDev', function(req, res, next) {
  res.render('servicios/webDev', { titP: 'Desarrollo Web',
  titH: 'Lorem.net - WEB DEV',
  descripP: 'Creando páginas web para tus necesidades', 
  imgP: 'imgP_webDev',
  session: req.user})
});

module.exports = router;
