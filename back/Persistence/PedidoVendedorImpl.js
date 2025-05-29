const PedidoVendedor = require('../Models/PedidoVendedorModel');
const mongoose = require('mongoose');
const conectarDB = require('../DBManager/db');


class PedidoVendedorImpl {
  insertar(datos) {
    return conectarDB().then(() => {
      const pedido = new PedidoVendedor(datos);
      return pedido.save();
    }).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al insertar pedido al vendedor:", error);
      mongoose.disconnect();
    });
  }
  buscarPorId(id) {
    return conectarDB().then(() => PedidoVendedor.findById(id)).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al buscar pedido al vendedor:", error);
      mongoose.disconnect();
    });
  }
  actualizar(id, nuevosDatos) {
    return conectarDB().then(() => PedidoVendedor.findByIdAndUpdate(id, nuevosDatos, { new: true })).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al actualizar pedido al vendedor:", error);
      mongoose.disconnect();
    });
  }
  eliminar(id) {
    return conectarDB().then(() => PedidoVendedor.findByIdAndDelete(id)).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al eliminar pedido al vendedor:", error);
      mongoose.disconnect();
    });
  }
  listarTodos() {
    return conectarDB().then(() => PedidoVendedor.find()).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al listar pedidos al vendedor:", error);
      mongoose.disconnect();
    });
  }
}
module.exports = new PedidoVendedorImpl();
