const express = require('express');
const router = express.Router();
const pagoController = require('../Controllers/pagoController');
const { verifyToken, isCliente, isVendedor } = require('../Middleware/authJwt');

router.post('/create-checkout-session', pagoController.createCheckoutSession);
//Para poder guardar los datos de la compra en el cliente si es que pago bien
// routes/pagos.routes.js

module.exports = router;
