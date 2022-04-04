var express = require('express');
var router = express.Router();
var {client, dbName} = require('../db/mongo');
var passport = require('passport');
var ObjectId = require('mongodb').ObjectId

router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    req.logout();
    res.redirect('/');
  } else {
    res.render('admin/indexAdmin', { titP: 'Inicio de Sesión de Administrador',
    descripP: 'Ingrese usuario y contraseña para entrar', 
    titH: 'Lorem.net - ADMIN',
    imgP: 'imgP_admin'})
  }
});

router.post('/entrar',
  passport.authenticate('local', { failureRedirect: '/admin' }),
    function(req, res) {
      res.redirect('/admin/cotizaciones');
});

router.get('/cotizaciones', async function(req, res, next) {
  if (req.isAuthenticated()) {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('cotizaciones');
    let cots = await collection.find().toArray()
    res.render('admin/cotizaciones', { titP: 'Bienvenido Administrador',
    titH: 'Lorem.net - Welcome Admin',
    descripP: 'Listado de Cotizaciones Entrantes', 
    imgP: 'imgP_admin',
    cotis: cots});
  } else {
    res.redirect('/login');
  }
});

router.get('/admLogout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/:id', function(req, res, next){
  let id = req.params.id
  console.log(id)
  delCot(id)
  .then(()=>{
    res.redirect('/admin/cotizaciones')
  })
  .catch((err)=>{
      console.log(err);
  })
  .finally(()=>{
      client.close();
  })
})

async function delCot(datos){
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('cotizaciones');
  console.log(datos)
  await collection.findOneAndDelete({"_id":ObjectId(datos)})
}

module.exports = router;