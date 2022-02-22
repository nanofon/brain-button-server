import express from 'express';
import http from 'http'
import { Server } from 'socket.io'
//import router from './routes.js'
import handleMessage from './handle-message.js'

const app = express();
//app.use(router)
const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    socket.onAny((event, ...args) => {
        handleMessage(io, event, args);
    });
});

export default server;