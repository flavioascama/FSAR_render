
const mongoose = require('mongoose');
const conectarDB = require('../DBManager/db');
const Vendedor = require('../Models/VendedorModel');

class VendedorImpl {
  insertar(datos) {
    return conectarDB().then(() => {
        const vendedor = new Vendedor(datos);
        return vendedor.save();
      }).then((resultado) => {
        mongoose.disconnect();
        return resultado;
      }).catch((error) => {
        console.error("Error al insertar vendedor:", error);
        mongoose.disconnect();
      });
  }

  buscarPorId(id) {
    return conectarDB()
      .then(() => Vendedor.findById(id).populate('historialCompras'))
      .then((resultado) => {
        mongoose.disconnect();
        return resultado;
      })
      .catch((error) => {
        console.error("Error al buscar vendedor:", error);
        mongoose.disconnect();
      });
  }

  actualizar(id, nuevosDatos) {
    return conectarDB()
      .then(() => Vendedor.findByIdAndUpdate(id, nuevosDatos, { new: true }))
      .then((resultado) => {
        mongoose.disconnect();
        return resultado;
      })
      .catch((error) => {
        console.error("Error al actualizar vendedor:", error);
        mongoose.disconnect();
      });
  }

  eliminar(id) {
    return conectarDB()
      .then(() => Vendedor.findByIdAndDelete(id))
      .then((resultado) => {
        mongoose.disconnect();
        return resultado;
      })
      .catch((error) => {
        console.error("Error al eliminar vendedor:", error);
        mongoose.disconnect();
      });
  }

  listarTodos() {
    return conectarDB()
      .then(() => Vendedor.find())
      .then((resultado) => {
        mongoose.disconnect();
        return resultado;
      })
      .catch((error) => {
        console.error("Error al listar vendedores:", error);
        mongoose.disconnect();
      });
  }
}

module.exports = new VendedorImpl();