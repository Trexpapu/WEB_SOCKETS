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

const Lista_sockets = new Map();//lista donde se guarda id y objeto socket
const solicitudesPendientes = new Map();
const lista_sockets_en_chat = new Map();
//Conexion del web socket usuarios
io.on('connection', (socket) => {//permite escuchar las connexiones de los clientes, recuperamos el socket
    console.log('\nUn usuario se a conectado', socket.id)
    Lista_sockets.set(socket.id, socket);
    updateUsersList(); //Llamamos la funcion cada vez que se conecta un usuario

    socket.on('disconnect', () =>{//cuando un usuario se desconecta
        console.log("\nUn usuario se a desconectado", socket.id)
        Lista_sockets.delete(socket.id);//borramos de la lista el id del usuario que se salio
        updateUsersList(); //Llamamos la funcion cada vez que se desconecta un usuario
    })

    socket.on('chat message', async (msg) =>{ //El servidor recibe una peticion chat message
        io.emit('chat message', msg) //El servidor emite un broadcast con el mensaje que recibe en la funcion
    })
    
     // Cuando un cliente hace la peticion Chat grupal emitimos redirect que redirecciona a otro html
     socket.on('Chat grupal', () => {
        console.log('\nSe ha iniciado un chat grupal', socket.id)
         Lista_sockets.set(socket.id, socket);//agegamos el socket que se fue a la lista
    // Enviar el evento solo a este cliente
        socket.emit('redirect');
        
    })


    //manejo de actualizacion de la lista 
    function updateUsersList() {
        const userList = Array.from(Lista_sockets.keys());//obtenemos solo los id de la lista y hacemos broadcast al evento updateUsersList, pasando las id obtenidas
        io.emit('updateUsersList', userList);
    }

    socket.on('Individual_m',(msg, otro_id, salida) =>{ //cuando un cliente solicita un mensaje individual se recibe el mensaje y el id al cliente receptor
        const socketDestino = Lista_sockets.get(otro_id);//buscamos el id en la lista para obtener el socket asociado
        if (socketDestino && salida == false){
            socket.emit('Mensaje_individual', msg)//Llamamos el evento mensaje individual para el emisor
            socketDestino.emit('Mensaje_individual', msg)//igualmente para el receptor
        }else{
            socket.emit('Mensaje_individual', "El otro usuario se fue...")//si el emisor manda un mensaje y receptor no existe
        }
        

    })


    socket.on('Iniciar chat individual', (id_usuario) => {//cuando un cliente desea iniciar un chat individual se emite al socket destino la solicitud
        const socketDestino = Lista_sockets.get(id_usuario);
        if (socket.id !== id_usuario) {
            // Verificar si ya hay una solicitud pendiente para este usuario

                // Enviar la solicitud al usuario de destino
                socketDestino.emit('Solicitud de chat', {
                    remitente: socket.id,
                    
                });
                socket.emit('En espera de solicitud de chat', true)
            
        }
    })

    socket.on('Liberar solicitud', (id)=>{
        const socketDestino = Lista_sockets.get(id);
        if (socketDestino){
            socketDestino.emit('En espera de solicitud de chat', false)
        }
    })


    socket.on('Aceptar chat individual', (id_remitente) => {//Si el cliente acepta la solicitud manda el evento redirec2 al cliente solicitante y al que acepta
        const socketRemitente = Lista_sockets.get(id_remitente);
        const socket_en_chat = lista_sockets_en_chat.get(socket.id)
        if  (socket.id !== id_remitente) {
            if (socket_en_chat){
                socket.emit('Avisar_que_salio')
                console.log("xd")
            }
            lista_sockets_en_chat.set(id_remitente, socketRemitente);
            lista_sockets_en_chat.set(socket.id, socket);
            socket.emit('redirect2', id_remitente)
            socketRemitente.emit('redirect2', socket.id)

            console.log(lista_sockets_en_chat)
        }

    });

    socket.on('Sali', (id) => {
        const socketDestino = Lista_sockets.get(id);
    
        if (socketDestino) { // Verificar si socketDestino existe
            socketDestino.emit('Quedaste_solo');
        } else {
            console.log(`Error: No se encontró el socket para el usuario con ID ${id}`);
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


server.listen(puerto, ()=>{ // escuchamos al servidor
    console.log(`Servidor corriendo en el puerto ${puerto}`)
})