const express = require('express');

require('dotenv').config();
const PORT = process.env.PORT || 8080;

const app = express();

app.get('/',(req,res)=>{
    res.send({message:"Bienvenido a mi API"})
})

app.listen(PORT, ()=>{
    console.log(`Escuchando en el puerto ${PORT}`);
})
