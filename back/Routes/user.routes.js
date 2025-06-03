const { verifyToken, isCliente, isVendedor } = require('../Middleware/authJwt');
const controller = require('../Controllers/user.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  app.get('/vendedores', [verifyToken, isCliente], controller.listarVendedores);
};
