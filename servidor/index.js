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

const Lista_sockets = new Map();
const solicitudesPendientes = new Map();
//Conexion del web socket usuarios
io.on('connection', (socket) => {//permite escuchar las connexiones de los clientes, recuperamos el socket
    console.log('\nUn usuario se a conectado', socket.id)
    Lista_sockets.set(socket.id, socket);
    updateUsersList(); 

    socket.on('disconnect', () =>{//cuando un usuario se desconecta
        console.log("\nUn usuario se a desconectado", socket.id)
        Lista_sockets.delete(socket.id);
        updateUsersList(); 
    })

    socket.on('chat message', async (msg) =>{ //el servidor recibe el mensaje del cliente
        io.emit('chat message', msg) //hacemos broadcast con el servidor
    })
    
     // Escucha el evento 'ChatGrupal' y realiza la lógica correspondiente
     socket.on('Chat grupal', () => {
        console.log('\nSe ha iniciado un chat grupal', socket.id)
         Lista_sockets.set(socket.id, socket);
    // Enviar el evento solo a este cliente
        socket.emit('redirect');
        
    })


    //manejo de actualizacion de la lista 
    function updateUsersList() {
        const userList = Array.from(Lista_sockets.keys());
        io.emit('updateUsersList', userList);
    }

    socket.on('Individual_m',(msg) =>{ //el servidor recibe el mensaje del cliente
        io.emit('Mensaje_individual', msg) 
        

    })


    socket.on('Iniciar chat individual', (id_usuario) => {
        const socketDestino = Lista_sockets.get(id_usuario);
        if (socket.id !== id_usuario) {
            // Verificar si ya hay una solicitud pendiente para este usuario
            if (!solicitudesPendientes.has(id_usuario)) {
                // Agregar la solicitud a la lista de solicitudes pendientes
                solicitudesPendientes.set(id_usuario, socket.id);

                // Enviar la solicitud al usuario de destino
                socketDestino.emit('Solicitud de chat', {
                    remitente: socket.id,
                    
                });
            }
        }
    })


    socket.on('Aceptar chat individual', (id_remitente) => {
        const socketRemitente = Lista_sockets.get(id_remitente);
        if (socket.id !== id_remitente) {
            socket.emit('redirect2')
            socketRemitente.emit('redirect2')
            
        }

    });

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
    // Obtén el ID del socket de la URL
    res.sendFile(process.cwd() + '/cliente/individual.html')//vamos a enviar un archivo html
    
})


server.listen(puerto, ()=>{ // escuchamos al servidor
    console.log(`Servidor corriendo en el puerto ${puerto}`)
})