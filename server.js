import express from 'express';
import http from 'http'
import { Server } from 'socket.io'
import router from './routes.js'
import {v4 as uuidv4} from 'uuid'
import { BiMap } from './bidirectional-map.js';
import { RoomManager } from './room-manager.js';

const port = process.env.PORT || 3000;
const app = express();
app.use(router)
const server = http.createServer(app)
const io = new Server(server)
const clientSocketMap = new BiMap()
const socketById = new Map()
const roomManager = new RoomManager(clientSocketMap, socketById, io)

io.on('connection', (socket) => {
    socketById.set(socket.id, socket)
    console.log(`${socket.id} connected`);

    socket.on('clientId', (clientId) => {
        clientSocketMap.add(socket.id, clientId)
        roomManager.connectDisconnect(socket.id)
    })

    socket.on('join', (clientId) => {
        roomManager.join([clientId, clientSocketMap.get(socket.id)])
    })
    
    socket.on('disconnect', async () => {
        roomManager.connectDisconnect(socket.id)
        socketById.delete(socket.id)
        clientSocketMap.remove(socket.id)
        console.log(`${socket.id} disconnected`);
    });
});

server.listen(port, () => {
    console.log(`Express-based server listening on port ${port}`);
});