const express = require('express');
const passport = require('passport');
const controller = require('../Controllers/auth.controller');
const verifySignUp = require('../Middleware/verifySignUp');
const jwt = require('jsonwebtoken');
const Persona = require('../Models/PersonaModel');

const router = express.Router();


router.get('/check', async (req, res) => {
  if (req.session?.token) {
    try {
      const decoded = jwt.verify(req.session.token, process.env.jwtSecret);
      const persona = await Persona.findById(decoded.id).lean();
      console.log("Verificando sesión de usuario:", persona);
      if (persona) {
        return res.json({
          loggedIn: true,
          user: {
            id: persona._id,
            nombre: persona.nombre,
            email: persona.correo,
            rol: persona.rol,
            nombreTienda: persona.nombreTienda || null // Asegura que este campo exista
          }
          
        });
      }
    } catch {
      return res.json({ loggedIn: false });
    }
  }

  res.json({ loggedIn: false });
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/public/login/login.html' }),
  async (req, res) => {
    const correo = req.user.email;
    const Persona = require('../Models/PersonaModel'); // importa el modelo

    const persona = await Persona.findOne({ correo });
    //Verifica si la persona existe
    // Si no existe, redirige a la página de registro
    if (!persona) {
      return res.redirect('/public/signup/signup.html');
    }

    // Crear token y asignar sesión
    const token = jwt.sign({ id: persona._id }, process.env.jwtSecret, {
      algorithm: "HS256",
      expiresIn: 86400 // 24 horas
    });
    req.session.token = token;
    req.session.userId = persona._id;
    req.session.userName = persona.nombre;

    // Redirigir según rol
    if (persona.rol === 'cliente') return res.redirect('/private/cliente/cliente.html');
    if (persona.rol === 'vendedor') return res.redirect('/private/vendedor/vendedor.html');

    return res.redirect('/'); // por defecto
  }
);


router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

//esta ruta es para verificar si el usuario está autenticado
router.post('/signup', [verifySignUp.checkDuplicateEmail], controller.signup);
//esta ruta es para iniciar sesión
router.post('/signin', controller.signin);
//esta ruta es para cerrar sesión
router.post('/logout', controller.signout);

router.get('/cliente/datos', (req, res) => {
  try {
    // Verificar si hay sesión activa
    if (req.session && req.session.userId) {
      return res.status(200).json({
        success: true,
        data: {
          id: req.session.userId,
          // Puedes agregar más datos si los necesitas
          rol: req.session.userRole || null
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'No hay cliente autenticado'
      });
    }
  } catch (error) {
    console.error('Error al obtener datos del cliente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});
module.exports = router;