const { verifyToken, isCliente, isVendedor } = require('../middlewares/authJwt');
const controller = require('../Controllers/user.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  app.get('/api/test/publico', controller.publicAccess);
  app.get('/api/test/cliente', [verifyToken, isCliente], controller.clienteAccess);
  app.get('/api/test/vendedor', [verifyToken, isVendedor], controller.vendedorAccess);
};
