import {v4 as uuidv4} from 'uuid'

export class RoomManager{
    constructor(){
        this.clientsInRoom = new Map()
        this.roomOfClient = new Map()
    }

    get rooms () {return this.clientsInRoom.keys()}

    getClients (roomId) {
        return this.clientsInRoom.get(roomId)
    }

    getRoom (clientId) {
        return this.roomOfClient.get(clientId)
    }
    
    join(clients){
        let roomsOfClients = clients.map(client => {
            return this.roomOfClient.get(client)
        }).filter(room => room)
        if(roomsOfClients.length === 0){
            const room = uuidv4()
            this.clientsInRoom.set(room, new Set(clients))
            clients.forEach(client =>{
                this.roomOfClient.set(client, room)
            })
            return
        }
        let clientsInRooms = roomsOfClients.map(room => {
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

        clientsInRooms.forEach(obj => {
            if(obj.room !== survivorRoom){this.clientsInRoom.delete(obj.room)}
        })
        
        listOfClients.forEach(client => {
            this.roomOfClient.set(client, survivorRoom)
        })
    }

    removeClient(clientId){
        let room = this.roomOfClient.get(clientId)
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