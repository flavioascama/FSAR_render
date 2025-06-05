const stripe = require('../Config/stripe');
//const PedidoCliente = require('../models/PedidoCliente');


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
          quantity: product.quantity || 1, 
        }
      ],
      mode: 'payment',
      success_url: 'http://localhost:8000/private/cliente/success.html',
      cancel_url: 'http://localhost:8000/private/cliente/cancel.html',
    });

    res.json({ url: session.url }); // URL completa
  } catch (error) {
    console.error('Error en Stripe:', error);
    res.status(500).json({ error: 'No se pudo crear sesión' });
  }
};


