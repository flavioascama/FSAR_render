const { verifyToken, isCliente, isVendedor } = require('../Middleware/authJwt');
const controller = require('../Controllers/user.controller');
const express = require('express');
const router = require('./auth.routes');
const routerUsers = express.Router();

routerUsers.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

//Rutas para que use el vendedor
routerUsers.delete('/vendedor/eliminarProducto/:id', [verifyToken, isVendedor], controller.eliminarProducto); //
routerUsers.get('/vendedor/misProductos', [verifyToken, isVendedor],controller.listarProductos); //
routerUsers.put('/vendedor/guardarProducto', [verifyToken, isVendedor], controller.guardarProducto); //
//routerUsers.get('/vendedor/misPedidos', [verifyToken, isVendedor], controller.listarPedidos); //
//Rutas para que use el cliente
routerUsers.get('/cliente/productos/:id', controller.listarProductos); //
routerUsers.get('/cliente/listaVendedores', [verifyToken, isCliente],controller.listarVendedores);
routerUsers.get('/pedidos/historial', [verifyToken, isCliente], controller.listasHistorialDePedidos); 


module.exports = routerUsers;