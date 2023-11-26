import express from 'express' //Framework para una infrestuctura web y APIS
import morgan from 'morgan' //Dependencia para peticiones de express
import logger from 'morgan' // importamos el logger de morgan


import { Server } from 'socket.io'  //Creacion de servidor de web sockets
import { createServer } from 'node:http' //Importacion de creacion de servidor http



const puerto = process.env.PORT ?? 50000 //puerto por defecto  que sea la 50000
const app = express() //inicializamos la app de express
const server =createServer(app) //Creando servidor http
const io = new Server(server, {
    connectionStateRecovery: {} //recuperar mensajes perdidos cuando no hay conexion
}) //Creando servidor io

const socketToWindow = new Map();
//Conexion del web socket usuarios
io.on('connection', (socket) => {//permite escuchar las connexiones de los clientes, recuperamos el socket
    console.log('\nUn usuario se a conectado', socket.id)
    socketToWindow.set(socket.id, null)
    updateUsersList(); 

    socket.on('disconnect', () =>{//cuando un usuario se desconecta
        console.log("\nUn usuario se a desconectado", socket.id)
        socketToWindow.delete(socket.id);
        updateUsersList(); 
    })

    socket.on('chat message', async (msg) =>{ //el servidor recibe el mensaje del cliente
        io.emit('chat message', msg) //hacemos broadcast con el servidor
    })
    
     // Escucha el evento 'ChatGrupal' y realiza la lógica correspondiente
     socket.on('Chat grupal', () => {
        console.log('\nSe ha iniciado un chat grupal', socket.id)
         socketToWindow.set(socket.id);
    // Enviar el evento solo a este cliente
        socket.emit('redirect');
        
    })


    //manejo de actualizacion de la lista 
    function updateUsersList() {
        const userList = Array.from(socketToWindow.keys());
        io.emit('updateUsersList', userList);
    }



})



app.use(logger('dev')) //en un servidor Express.js configura un middleware llamado "logger" que se utiliza para registrar información sobre las peticiones HTTP que llegan al servidor.
//(Registros de solicitudes entrantes, Tiempo de respuesta, Informacion sobre errores)


app.get('/', (req, res) =>{
    res.sendFile(process.cwd() + '/cliente/interfaz.html')//vamos a enviar un archivo html
    
})

app.get('/grupo', (req, res) =>{
    res.sendFile(process.cwd() + '/cliente/grupo.html')//vamos a enviar un archivo html
    
})

app.get('/individual', (req, res) =>{
    res.sendFile(process.cwd() + '/cliente/individual.html')//vamos a enviar un archivo html
    
})


server.listen(puerto, ()=>{ // escuchamos al servidor
    console.log(`Servidor corriendo en el puerto ${puerto}`)
})