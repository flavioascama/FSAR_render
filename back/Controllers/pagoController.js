const stripe = require('../Config/stripe');
//const PedidoCliente = require('../models/PedidoCliente');
const PedidoImpl = require('../Persistence/PedidoClienteImpl'); // llamo a mi IMpl para insertar los pedidos
const PedidoCliente = require('../Domain/PedidoCliente');

exports.createCheckoutSession = async (req, res) => {
  const { product } = req.body;
  console.log(product);
  try {

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pen',
            product_data: { name: product.name },
            unit_amount: product.price
          },
          quantity: product.quantity || 1, // Aseguramos que quantity sea un número
        }
      ],
      mode: 'payment',
      success_url: 'http://localhost:8000/private/cliente/success.html',
      cancel_url: 'http://localhost:8000/private/cliente/cancel.html',
    });

    res.json({ url: session.url }); // ✅ URL completa
  } catch (error) {
    console.error('Error en Stripe:', error);
    res.status(500).json({ error: 'No se pudo crear sesión' });
  }
};
var productos = [];



exports.registrarPedido = async (req, res) => {
  try {
    const clienteId = req.userId; // lo obtienes del token
    const nombreCookie = `carrito_${clienteId}`;
    const carritoCookie = req.cookies[nombreCookie];
    const productosPorTienda = [];

    if (!carritoCookie) {
      return res.status(400).json({ message: 'No se encontró el carrito del cliente' });
    }

    const carritoData = JSON.parse(decodeURIComponent(carritoCookie));
    const productos = carritoData.productos || [];


    productos.forEach(item => {
      const tiendaIndex = productosPorTienda.findIndex(t => t.vendedorId == item.vendedorId);
      const subtotalItem = item.precio * item.cantidad;

      if (tiendaIndex === -1) {
        productosPorTienda.push({
          vendedorId: item.vendedorId,
          productos: [{ productoId: item.productoId, cantidad: item.cantidad }],
          subtotal: subtotalItem
        });
      } else {
        productosPorTienda[tiendaIndex].productos.push({
          productoId: item.productoId,
          cantidad: item.cantidad
        });
        productosPorTienda[tiendaIndex].subtotal += subtotalItem;
      }
    });

    const total = productosPorTienda.reduce((acc, tienda) => acc + tienda.subtotal, 0);
    // 👉 Aquí recibes los datos del formulario (nombre, dirección, teléfono, etc.)
    const { direccion, telefono, nombres, cuponesAplicados = [] } = req.body;

    // Crear el pedido
    const nuevoPedido = new PedidoCliente(
      undefined,         // 
      clienteId,
      productosPorTienda,
      total,
      direccion,
      telefono,
      nombres,
      []                 // cuponesAplicados pero aun estan vacios
    );

    // Guardar el pedido
    await PedidoImpl.insertar(nuevoPedido);
    // Borrar la cookie de carrito ya que ya se proceso todo el pago de esos productos
    res.clearCookie(nombreCookie, { path: '/' });
    res.status(201).json({ message: 'Pedido guardado correctamente' });
  } catch (error) {
    console.error('Error guardando pedido:', error);
    res.status(500).json({ message: 'Error al guardar el pedido' });
  }
};


