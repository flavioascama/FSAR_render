const express = require('express');
const cookieSession = require('cookie-session'); //Para mantener la sesión del usuario
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
const bodyParser = require('body-parser');
const multer = require('multer');



require('dotenv').config();
const PORT = process.env.PORT || 8080;
const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));




app.get('/',(req,res)=>{
    res.send({message:"Bienvenido a mi API"})
})

app.listen(PORT, ()=>{
    console.log(`Escuchando en el puerto ${PORT}`);
})
