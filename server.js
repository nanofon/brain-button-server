import express from 'express';
import http from 'http'
import { Server } from 'socket.io'
import router from './routes.js'
import {v4 as uuidv4} from 'uuid'

const port = process.env.PORT || 3000;
const app = express();
app.use(router)
const server = http.createServer(app)
const io = new Server(server)
const sockets = {}

const joinPlayers = (id1, id2) => {
    console.log(`Joining players ${id1} and ${id2}`)
    const topic = 'join the group'
    let sidsMap = io.of('/').adapter.sids
    let roomsMap = io.of('/').adapter.rooms
    let [ , room1] = sidsMap.get(id1)
    let [ , room2] = sidsMap.get(id2)
    if(room1 & room2){
        let members1 = roomsMap.get(room1)
        let members2 = roomsMap.get(room1)
        if(members1.size > members2.size){
            members2.forEach((id) => {
                sockets[id].join(room1)
            })
            return
        }
        members1.forEach((id) => {
            sockets[id].join(room2)
        })
        return
    }
    if(room1){
        sockets[id2].join(room1)
        return
    }
    if(room2){
        sockets[id1].join(room2)
        return
    }
    //create new room, both join
    let room = uuidv4()
    sockets[id1].join(room)
    sockets[id2].join(room)
    return
}

io.on('connection', (socket) => {
    sockets[socket.id] = socket
    console.log(`${socket.id} connected`);

    socket.on('join', (other) => {
        // other - socket.id of the guy to join 
        joinPlayers(socket.id, other)
    })
    
    socket.on('alarma', (msg) => {
        console.log(`Received ${msg} under 'alarma' topic`);
        io.emit('no-panic', `Message "${msg}" received by server under "alarma" topic and sent back under "no-panic" topic`)
    });
    
    socket.on('disconnect', () => {
        delete sockets[socket.id]
        console.log(`${socket.id} disconnected`);
    });
});

server.listen(port, () => {
    console.log(`Express-based server listening on port ${port}`);
});