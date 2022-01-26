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
const clientsBySocketId = new BiMap()
const rooms = RoomManager()

const groupOfTeam = (socketId) => {
    try {
        let [ , room ] = io.of('/').adapter.sids.get(socketId)
        console.log(`groupOfTeam(${socketId}:${room})`)
        return room
    } catch (error){
        if(error instanceof TypeError){
            console.log(`groupOfTeam(${socketId}):${[]}`)
            return undefined
        } else {
            console.log(error)
            return
        }
    }
}

const teamsInGroup = (groupId) => {
    const sidsMap = io.of('/').adapter.rooms.get(groupId)
    console.log(`sidsMap of ${groupId} : ${sidsMap}`)
    if(sidsMap === undefined){return []} 
    return Array.from(sidsMap.keys())
}

const joinPlayers = (id1, id2) => {
    let room1 = groupOfTeam(id1)
    let room2 = groupOfTeam(id2)
    if(room1 & room1 === room2) {return}
    if(room1 & room2){
        let members1 = teamsInGroup(room1)
        let members2 = teamsInGroup(room2)
        if(members1.size > members2.size){
            members2.forEach((id) => {
                sockets[id].join(room1)
                sockets[id].leave(room2)
            })
        } else {
            members1.forEach((id) => {
                sockets[id].join(room2)
                sockets[id].leave(room1)
        })}
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
    let room = uuidv4()
    console.log(`room created: ${room}`)
    sockets[id1].join(room)
    sockets[id2].join(room)
    return
}

const emitRoomChange = (roomId) => {
    console.log(`emitting ${JSON.stringify(teamsInGroup(roomId))}`)
    io.to(roomId).emit('room update', JSON.stringify(teamsInGroup(roomId)))
}

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    socket.on('clientId', (clientId) => {
        clientsBySocketId.add(socket.id, clientId)
    })

    socket.on('join', (clientId) => {
        joinPlayers(socket.id, clientsBySocketId.get(clientId))
        emitRoomChange(groupOfTeam(socket.id))
    })
    
    socket.on('disconnect', async () => {
        clientsBySocketId.remove(socket.id)
        const roomId = groupOfTeam(socket.id)
        await socket.leave(roomId)
        console.log(roomId)
        emitRoomChange(roomId)
        //delete sockets[socket.id]
        console.log(`${socket.id} disconnected`);
    });
});

server.listen(port, () => {
    console.log(`Express-based server listening on port ${port}`);
});