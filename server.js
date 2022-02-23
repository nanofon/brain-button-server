import express from 'express';
import http from 'http'
import { Server } from 'socket.io'
//import router from './routes.js'

const app = express();
//app.use(router)
const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    
    socket.on('teams update', message => {
        message.to.forEach(socketId => {
            io.to(socketId).emit('teams update', message.data);
        });
    });


});

export default server;

// message = {
//    to: [socketId, ],
//    data: {
//      teamId: {
//          socketId:socketId,
//          name:name,
//          ...
//      },
//    ...
// }