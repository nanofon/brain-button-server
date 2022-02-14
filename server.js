import express from 'express';
import http from 'http'
import { Server } from 'socket.io'
import router from './routes.js'
import { RoomManager } from './room-manager.js';

const port = process.env.PORT || 3000;
const app = express();
app.use(router)
const server = http.createServer(app)
const io = new Server(server)
const roomManager = new RoomManager(io)

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    socket.on('clientId', (clientId) => {
        roomManager.onClientId(socket, clientId);
    });

    socket.on('join', (clientId) => {
        roomManager.join(socket, clientId);
    });
    
    socket.on('disconnect', async () => {
        console.log(`${socket.id} disconnected`);
    });
});

server.listen(port, () => {
    console.log(`Express-based server listening on port ${port}`);
});