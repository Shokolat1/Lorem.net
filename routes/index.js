var express = require('express');
var router = express.Router();
var {client, dbName} = require('../db/mongo');
var passport = require('passport');
const { ObjectId } = require('mongodb');
var mercadopago = require('mercadopago');
mercadopago.configurations.setAccessToken("APP_USR-6766770717086788-042719-6eef27ad0bdd2a67d1a4a1aeec914d02-1113901710");

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

  let type = req.user.profile
  
  res.render('chat', { titP: 'Servicio al Cliente',
  titH: 'Lorem.net - CHAT',
  descripP: 'Comunícate con nuestros profesionales', 
  imgP: 'imgP_contacto',
  session: req.user,
  tipo: type.startsWith('a')});
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

// MERCADO PAGO
router.post('/process_payment', function(req, res, next){
  mercadopago.payment.save(req.body)
  .then(function(response) {
    console.log(response);
    const { status, status_detail, id } = response.body;
    res.status(response.status).json({ status, status_detail, id });
  })
  .catch(function(error) {
    console.error(error);
  });
})

router.post("/process_payment", (req, res, next) => {
  const { body } = req;
  const { payer } = body;

  const paymentData = {
    transaction_amount: Number(body.transaction_amount),
    token: body.token,
    description: body.description,
    installments: Number(body.installments),
    payment_method_id: body.paymentMethodId,
    issuer_id: body.issuerId,
    payer: {
      email: payer.email,
      identification: {
        type: payer.identification.docType,
        number: payer.identification.docNumber,
      },
    },
  };
  mercadopago.payment
    .save(paymentData)
    .then(function (response) {
      const { response: data } = response;
      res.status(201).json({
        detail: data.status_detail,
        status: data.status,
        id: data.id,
      });

      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
      const { errorMessage, errorStatus } = validateError(error);
      res.status(errorStatus).json({ error_message: errorMessage });
    });
});

function validateError(error) {
  let errorMessage = "Unknown error cause";
  let errorStatus = 400;

  return { errorMessage, errorStatus };
}

module.exports = router;