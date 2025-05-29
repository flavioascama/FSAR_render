const mongoose = require('mongoose');
const Producto = require('../Models/ProductoModel');
const conectarDB = require('../DBManager/db');


class ProductoImpl {
  insertar(datos) {
    return conectarDB().then(() => {
      const producto = new Producto(datos);
      return producto.save();
    }).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al insertar producto:", error);
      mongoose.disconnect();
    });
  }
  buscarPorId(id) {
    return conectarDB().then(() => Producto.findById(id)).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al buscar producto:", error);
      mongoose.disconnect();
    });
  }
  actualizar(id, nuevosDatos) {
    return conectarDB().then(() => Producto.findByIdAndUpdate(id, nuevosDatos, { new: true })).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al actualizar producto:", error);
      mongoose.disconnect();
    });
  }
  eliminar(id) {
    return conectarDB().then(() => Producto.findByIdAndDelete(id)).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al eliminar producto:", error);
      mongoose.disconnect();
    });
  }
  listarTodos() {
    return conectarDB().then(() => Producto.find()).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al listar productos:", error);
      mongoose.disconnect();
    });
  }
}
module.exports = new ProductoImpl();
