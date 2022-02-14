import {v4 as uuidv4} from 'uuid'
import { BiMap } from './bidirectional-map.js';

export class RoomManager{
    constructor(io){
        this.io = io
        this.socketIdClient = new BiMap();
        this.socketIdSocket = new Map();
        this.clientRoom = new Map()
        this.roomClients = new Map()
    }

    onConnect(socket){
        this.socketIdSocket.set(socket.id, socket)
    }

    onClientId(socket, clientId){
        this.socketIdClient.add(socket.id, clientId)
        if(!this.clientRoom.has(clientId)){return}
        let room = this.clientRoom.get(clientId)
        socket.join(room)
        this.informRoom(room)
    }

    createRoom(clients){
        const room = uuidv4()
        this.roomClients.set(room, new Set(clients))
        clients.forEach(clientId =>{
            this.roomClients.set(clientId, room)
        })
        this.joinSockets(room, clients)
        return
    }

    join(socket, clientId){
        const clients = [this.socketIdClient.get(socket.id), clientId]
        
        const existingRoomsOfClients = clients.map(client => {
            return this.clientRoom.get(client)
        }).filter(room => room)

        if(existingRoomsOfClients.length === 0){
            this.createRoom(clients)
            return
        }

        let existingClientsInRooms = existingRoomsOfClients.map(room => {
            return {
                room: room,
                clients: this.clientsInRoom.get(room)
            }
        })
        existingClientsInRooms.sort((a,b) => {return a.clients.size < b.clients.size ? 1 : -1})

        const survivorRoom = existingClientsInRooms[0].room

        const mergedClients = new Set([...clientsInRooms.reduce(
            (prevSet, nextSet) => {
                return new Set([...prevSet, ...nextSet.clients])
            }, new Set()
        ), ...clients])

        this.roomClients.set(survivorRoom, mergedClients)
        this.joinSockets(survivorRoom, mergedClients)

        mergedClients.forEach(obj => {
            if(obj.room !== survivorRoom){
                this.roomClients.get(obj.room).forEach(client => {
                    this.socketIdSocket.get(this.socketIdClient(client)).leave(obj.room)
                })
                this.clientsInRoom.delete(obj.room)
            }
            this.clientRoom.set(obj.client, survivorRoom)
        })
    }

    informRoom(room){
        let message = [...this.roomClients.get(room)].map(clientId => {
            let socket = this.socketById.get(this.clientSocketMap.get(clientId))
            return {
                clientId:clientId,
                connected:socket ? socket.connected : false
            }
        })
        this.io.to(room).emit('room update', JSON.stringify(message))
    }

    onDisconnect(clientId){
        this.socketById.delete(socket.id)
        clientSocketMap.remove(socket.id)
        console.log(`${socket.id} disconnected`);
        if(!this.roomOfClient.has(clientId)){return}
        let room = this.roomOfClient.get(clientId)
        let socket = this.socketById(this.clientSocketMap.get(clientId))
        socket.join(room)
        this.informRooms(room)
    }

    joinSockets(room, clients){
        clients.forEach(
            client => {
                let socketId = this.clientSocketMap.get(client)
                if(socketId){this.socketById.get(socketId).join(room)}
            }
        )
        this.informRooms(room)
    }

    leaveSockets(room, clients){
        clients.forEach(
            client => this.socketById.get(
                this.clientSocketMap.get(client)
            ).leave(room)
        )
        this.informRooms(room)
    }

    removeClient(clientId){
        let room = this.roomOfClient.get(clientId)
        this.leaveSockets(room, clientId)
        let roomMembers = this.clientsInRoom.get(room)
        roomMembers.delete(clientId)
        this.roomOfClient.delete(clientId)
    }
}

// Tests below
/*
const roomManager = new RoomManager()
//console.log(roomManager)

roomManager.join(['user1', 'user2'])
//console.log(roomManager)

roomManager.join(['user3', 'user4', 'user5'])
//console.log(roomManager)

roomManager.join(['user6', 'user7'])

roomManager.join(['user1', 'user4'])
console.log(roomManager)

roomManager.removeClient('user5')
console.log(roomManager)
*/


// [socketId <-> clientId] <-> Rooms