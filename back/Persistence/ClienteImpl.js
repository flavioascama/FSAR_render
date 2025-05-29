
const mongoose = require('mongoose');
const conectarDB = require('../DBManager/db');
const Cliente = require('../Models/ClienteModel');

class ClienteImpl {
  insertar(datos) {
    return conectarDB()
      .then(() => {
        const cliente = new Cliente(datos);
        return cliente.save();
      })
      .then((resultado) => {
        mongoose.disconnect();
        return resultado;
      })
      .catch((error) => {
        console.error("Error al insertar cliente:", error);
        mongoose.disconnect();
      });
  }

  buscarPorId(id) {
    return conectarDB()
      .then(() => Cliente.findById(id).populate('historialCompras'))
      .then((resultado) => {
        mongoose.disconnect();
        return resultado;
      })
      .catch((error) => {
        console.error("Error al buscar cliente:", error);
        mongoose.disconnect();
      });
  }

  actualizar(id, nuevosDatos) {
    return conectarDB()
      .then(() => Cliente.findByIdAndUpdate(id, nuevosDatos, { new: true }))
      .then((resultado) => {
        mongoose.disconnect();
        return resultado;
      })
      .catch((error) => {
        console.error("Error al actualizar cliente:", error);
        mongoose.disconnect();
      });
  }

  eliminar(id) {
    return conectarDB()
      .then(() => Cliente.findByIdAndDelete(id))
      .then((resultado) => {
        mongoose.disconnect();
        return resultado;
      })
      .catch((error) => {
        console.error("Error al eliminar cliente:", error);
        mongoose.disconnect();
      });
  }

  listarTodos() {
    return conectarDB()
      .then(() => Cliente.find())
      .then((resultado) => {
        mongoose.disconnect();
        return resultado;
      })
      .catch((error) => {
        console.error("Error al listar clientes:", error);
        mongoose.disconnect();
      });
  }
}

module.exports = new ClienteImpl();