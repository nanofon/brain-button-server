import {v4 as uuidv4} from 'uuid'

export class RoomManager{
    constructor(clientSocketMap, socketById, io){
        this.clientsInRoom = new Map()
        this.roomOfClient = new Map()
        this.clientSocketMap = clientSocketMap
        this.socketById = socketById
        this.io = io
    }

    get rooms () {return this.clientsInRoom.keys()}

    getClients (roomId) {
        return this.clientsInRoom.get(roomId)
    }

    getRoom (clientId) {
        return this.roomOfClient.get(clientId)
    }

    informRooms(room){
        let message = [...this.clientsInRoom.get(room)].map(clientId => {
            let socket = this.socketById.get(this.clientSocketMap.get(clientId))
            return {
                clientId:clientId,
                connected:socket.connected
            }
        })
        this.io.to(room).emit('room update', JSON.stringify(message))
    }

    connectDisconnect(socketId){
        let clientId = this.clientSocketMap.get(socketId)
        if(!clientId | !this.roomOfClient.has(clientId)){return}
        let room = this.roomOfClient.get(clientId)
        this.informRooms(room)
    }

    joinSockets(room, clients){
        clients.forEach(
            client => this.socketById.get(
                this.clientSocketMap.get(client)
            ).join(room)
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
    
    join(clients){
        let existingRoomsOfClients = clients.map(client => {
            return this.roomOfClient.get(client)
        }).filter(room => room)

        if(existingRoomsOfClients.length === 0){
            const room = uuidv4()
            this.clientsInRoom.set(room, new Set(clients))
            clients.forEach(clientId =>{
                this.roomOfClient.set(clientId, room)
            })
            this.joinSockets(room, clients)
            return
        }

        let clientsInRooms = existingRoomsOfClients.map(room => {
            return {
                room: room,
                clients: this.clientsInRoom.get(room)
            }
        })
        clientsInRooms.sort((a,b) => {return a.clients.size < b.clients.size ? 1 : -1})

        const survivorRoom = clientsInRooms[0].room

        const listOfClients = new Set([...clientsInRooms.reduce(
            (prevSet, nextSet) => {
                return new Set([...prevSet, ...nextSet.clients])
            }, new Set()
        ), ...clients])

        this.clientsInRoom.set(survivorRoom, listOfClients)
        this.joinSockets(survivorRoom, listOfClients)

        clientsInRooms.forEach(obj => {
            if(obj.room !== survivorRoom){
                this.clientsInRoom.get(obj.room).forEach(client => {
                    this.socketById(this.clientSocketMap.get(client))
                        .leave(obj.room)
                })
                this.clientsInRoom.delete(obj.room)
            }
        })
        
        listOfClients.forEach(client => {
            this.roomOfClient.set(client, survivorRoom)
        })
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