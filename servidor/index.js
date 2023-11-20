import express from 'express' //Framework para una infrestuctura web y APIS
import morgan from 'morgan' //Dependencia para peticiones de express
import logger from 'morgan' // importamos el logger de morgan
import dotenv from 'dotenv' //Leer variables de entorno
import { createClient } from '@libsql/client' //Crear cliente

import { Server } from 'socket.io'  //Creacion de servidor de web sockets
import { createServer } from 'node:http' //Importacion de creacion de servidor http

dotenv.config()//Lee varieble de entorno

const puerto = process.env.PORT ?? 50000 //puerto por defecto  que sea la 50000
const app = express() //inicializamos la app de express
const server =createServer(app) //Creando servidor http
const io = new Server(server, {
    connectionStateRecovery: {} //recuperar mensajes perdidos cuando no hay conexion
}) //Creando servidor io

//Conexion a la base de datos
const db = createClient({
    url: 'libsql://honest-weapon-x-xxnightmarexx25.turso.io'
    authToken: process.env.DB_TOKEN
})

await db.execute('Crear tabla si no existe(id entero es la llave primaria que se autoincrementa,contenido del texto)')
//Conexion del web socket usuarios
io.on('connection', (socket) => {//permite escuchar las connexiones de los clientes, recuperamos el socket
    console.log('Un usuario se a conectado')

    socket.on('disconnect', () =>{//cuando un usuario se desconecta
        console.log("Un usuario se a desconectado")
    })

    socket.on('chat message', async (msg) =>{ //el servidor recibe el mensaje del cliente
        let result
        try{

            result=await db.execute({
                sql:''
            })
        
        }catch(e){

        }
        io.emit('chat message', msg) //hacemos broadcast con el servidor
    })
})



app.use(logger('dev')) //en un servidor Express.js configura un middleware llamado "logger" que se utiliza para registrar información sobre las peticiones HTTP que llegan al servidor.
//(Registros de solicitudes entrantes, Tiempo de respuesta, Informacion sobre errores)

app.get('/', (req, res) =>{
    res.sendFile(process.cwd() + '/cliente/index.html')//vamos a enviar un archivo donde se inicial el proceso es decir el index.html
})

server.listen(puerto, ()=>{ // escuchamos al servidor
    console.log(`Servidor corriendo en el puerto ${puerto}`)
})