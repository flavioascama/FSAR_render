const Persona = require('../Models/PersonaModel');
const Vendedor = require('../Models/VendedorModel'); // para listar productos por ID de vendedor
const Producto = require('../Models/ProductoModel'); // para listar productos por ID de vendedor
const PedidoCliente = require('../Models/PedidoClienteModel'); // para listar historial de pedidos del cliente
const ProductoImpl = require('../Persistence/ProductoImpl'); // Para eliminar, guardar, productos netamente
exports.listarProductos = async (req, res) => {
  try {

    const vendedorId = req.params.id || req.userId; 
    if (!vendedorId) {
      return res.status(400).json({ message: 'Falta el parámetro vendedor' });
    }
    const productos = await Producto.find({ vendedorId });
    res.status(200).json({ productos });

  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    const vendedor = await Persona.findById(req.userId);
    const productoId = req.params.id;

    if (!productoId) {
      return res.status(400).json({ message: 'Falta el ID del producto' });
    }

    await vendedor.productos.pull(productoId); // Eliminar el producto del vendedor
    await ProductoImpl.eliminar(productoId);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }

};
exports.guardarProducto = async (req, res) => {

  try {
    const productoData = req.body; //aca esta los datos del producto (pero el id del vendedor no lo estaba capturando bien)
    const vendedor = await Vendedor.findById(req.userId); //con el verifyToken, obtuve el vendedorId y lo aprovechoi aca
    productoData.vendedorId=req.userId; // Asignar el ID del vendedor al producto

    if (!vendedor) {
      return res.status(404).json({ message: 'Vendedor no encontrado' });
    } //solo vericiamos si es que existe ese vendedor nomas

    const nuevoProducto = new Producto({
      ...productoData,
      vendedorId: vendedor._id
    }); //Aca me daba error porque necesito insertar un "producto" en el array, asi que creamos el objeto

    vendedor.productos.push(nuevoProducto); // Agregar el producto al vendedor
    await ProductoImpl.insertar(productoData); //ejecutamos el insertar del producto en la bd
    await vendedor.save(); //guardamos el cambio en el vendedor

    res.status(201).json({ message: 'Producto guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar producto:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
exports.listarVendedores = async (req, res) => {
  try {
    const vendedores = await Persona.find({ rol: 'vendedor' }).select('-contraseña').lean(); // evita enviar contraseña
    res.status(200).json(vendedores);
  } catch (error) {
    console.error('Error al listar vendedores:', error);
    // next(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.listasHistorialDePedidos = async (req, res) => {
  try {
    const historial = await PedidoCliente.find({ clienteId: req.userId })
      .populate('productosPorTienda.tiendaId', 'nombre nombreTienda') // Esto es para obtener solo el nombre de la tienda por su id
      .populate('productosPorTienda.productos.productoId'); // esto es para que me regrese los productos de cada tienda
    res.status(200).json(historial);
  } catch (error) {
    console.error('Error al listar historial de pedidos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
exports.agregarCupones = async (req, res) => {
  try {
    const { cupones } = req.body; // Debe ser un array de objetos cupón
    const vendedor = await Vendedor.findById(req.userId);

    if (!vendedor) {
      return res.status(404).json({ message: 'Vendedor no encontrado' });
    }

    for (const cupon of cupones) {
      cupon.vendedorId = req.userId; 

      // Insertar cupón 
      const cuponGuardado = await CuponImpl.insertar(cupon);
      vendedor.cupones.push(cuponGuardado._id);
    }

    await vendedor.save();

    res.status(201).json({ message: 'Cupones agregados correctamente' });
  } catch (error) {
    console.error('Error al agregar cupones:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
