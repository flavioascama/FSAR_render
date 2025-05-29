
const mongoose = require('mongoose');
const conectarDB = require('../DBManager/db');
const Cupon = require('../Models/CuponModel');

class CuponImpl {
  insertar(datos) {
    return conectarDB().then(() => {
      const cupon = new Cupon(datos);
      return cupon.save();
    }).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al insertar cupon:", error);
      mongoose.disconnect();
    });
  }
  buscarPorId(id) {
    return conectarDB().then(() => Cupon.findById(id)).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al buscar cupon:", error);
      mongoose.disconnect();
    });
  }
  actualizar(id, nuevosDatos) {
    return conectarDB().then(() => Cupon.findByIdAndUpdate(id, nuevosDatos, { new: true })).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al actualizar cupon:", error);
      mongoose.disconnect();
    });
  }
  eliminar(id) {
    return conectarDB().then(() => Cupon.findByIdAndDelete(id)).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al eliminar cupon:", error);
      mongoose.disconnect();
    });
  }
  listarTodos() {
    return conectarDB().then(() => Cupon.find()).then((resultado) => {
      mongoose.disconnect();
      return resultado;
    }).catch((error) => {
      console.error("Error al listar cupones:", error);
      mongoose.disconnect();
    });
  }
}
module.exports = new CuponImpl();