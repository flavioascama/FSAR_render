const express = require('express');
//const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
//const multer = require('multer');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ───── FRONTEND ─────
app.use(express.static(path.join(__dirname, '../front')));
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Escuchando en el puerto ${PORT}`);
});
