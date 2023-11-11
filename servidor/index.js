import express from 'express' //Framework para una infrestuctura web y APIS
import morgan from 'morgan' //Dependencia para peticiones de express
import logger from 'morgan' // importamos el logger de morgan

const puerto = process.env.PORT ?? 50000 //puerto por defecto  que sea la 50000
const app = express() //inicializamos la app de express
app.use(logger('dev')) //en un servidor Express.js configura un middleware llamado "logger" que se utiliza para registrar información sobre las peticiones HTTP que llegan al servidor.
//(Registros de solicitudes entrantes, Tiempo de respuesta, Informacion sobre errores)

app.get('/', (req, res) =>{ //Si vamos a nuestra pagina principal contestamos con esta funcion que dice este mensaje
    res.sendFile(process.cwd() + '/cliente/index.html')//vamos a enviar un archivo donde se inicial el proceso es decir el index.html
})

app.listen(puerto, ()=>{ //Inicalizar el servidor web prueba
    console.log(`Servidor corriendo en el puerto ${puerto}`)
})