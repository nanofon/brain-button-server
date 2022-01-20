import express from 'express';
import http from 'http'
import { Server } from 'socket.io'
import router from './routes.js'

const port = process.env.PORT || 3000;
const app = express();
app.use(router)
const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    console.log(`a user connected`);
    
    socket.on('alarma', (msg) => {
        console.log(`Received ${msg} under 'alarma' topic`);
        io.emit('no-panic', `Message "${msg}" received by server under "alarma" topic and sent back under "no-panic" topic`)
    });
    
    socket.on('disconnect', () => {
        console.log(`a user disconnected`);
    });
});

server.listen(port, () => {
    console.log(`Express-based server listening on port ${port}`);
});