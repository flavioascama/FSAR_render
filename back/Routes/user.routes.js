const { verifyToken, isCliente, isVendedor } = require('../Middleware/authJwt');
const controller = require('../Controllers/user.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  //Para poder listar los vendedores en la pagina principal del cliente, pero verifico si es cliente
  app.get('/listaVendedores', controller.listarVendedores);
};
