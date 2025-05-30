const Persona = require('../Models/PersonaModel');

exports.publicAccess = (req, res) => {
  res.status(200).send('Acceso público');
};

exports.clienteAccess = async (req, res) => {
  const persona = await Persona.findById(req.userId);
  res.status(200).send({ message: `Hola cliente ${persona.nombre}` });
};

exports.vendedorAccess = async (req, res) => {
  const persona = await Persona.findById(req.userId);
  res.status(200).send({ message: `Hola vendedor ${persona.nombre}` });
};
