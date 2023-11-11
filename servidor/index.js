import express from 'express'

const puerto = process.env.PORT ?? 50000 //puerto por defecto variable de enterno y si no por defecto que sea la 3000
const app = express() //inicializamos la app llamanda express

app.get('/', (req, res) =>{ //Si vamos a nuestra pagina principal contestamos con esta funcion que dice este mensaje
    res.send('<h1>Esto es el chat</h1>')
})

app.listen(puerto, ()=>{ //Inicalizar el servidor web 
    console.log(`Servidor corriendo en el puerto ${puerto}`)
})