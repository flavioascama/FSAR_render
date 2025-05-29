const PedidoCliente = require('../Models/PedidoClienteModel');
const mongoose = require('mongoose');
const conectarDB = require('../DBManager/db');

class PedidoClienteImpl {
  insertar(datos) {
    return conectarDB().then(() => {
      const pedido = new PedidoCliente(datos);
      return pedido.save();
    }).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al insertar pedido del cliente:", error);
      mongoose.disconnect();
    });
  }
  buscarPorId(id) {
    return conectarDB().then(() => PedidoCliente.findById(id)).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al buscar pedido del cliente:", error);
      mongoose.disconnect();
    });
  }
  actualizar(id, nuevosDatos) {
    return conectarDB().then(() => PedidoCliente.findByIdAndUpdate(id, nuevosDatos, { new: true })).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al actualizar pedido del cliente:", error);
      mongoose.disconnect();
    });
  }
  eliminar(id) {
    return conectarDB().then(() => PedidoCliente.findByIdAndDelete(id)).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al eliminar pedido del cliente:", error);
      mongoose.disconnect();
    });
  }
  listarTodos() {
    return conectarDB().then(() => PedidoCliente.find()).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al listar pedidos del cliente:", error);
      mongoose.disconnect();
    });
  }
}
module.exports = new PedidoClienteImpl();