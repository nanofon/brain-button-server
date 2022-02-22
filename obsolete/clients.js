import {v4 as uuidv4} from 'uuid'

const singleSet = (sets) => {
    return sets.reduce((a,b) => {
        return new Set([...a, ...b])
    }, new Set())
}

export default class Clients{
    constructor(){
        this.clientById = new Map()
        this.clientBySocketId = new Map()
        this.clientsByRoom = new Map()
    }

    byId(id){return this.clientById.get(id)}
    bySocketId(socketId){return this.clientBySocketId.get(socketId)}
    byRoom(roomId){return this.clientsByRoom.get(roomId)}

    add(client){
        this.clientById.set(client.id, client)
        this.clientBySocketId.set(client.socket.id, client)
        return client
    }

    join(clients){
        const existingRooms = Array.from(new Set(
            clients.map(client => client.room).filter(room => room)
        ))

        if(existingRooms.length === 0){
            return this.createRoom(clients)
        }

        existingRooms.sort((a,b) => {
            return this.clientsByRoom.get(a).size < this.clientsByRoom.get(b).size ? 1 : -1
        })

        const survivorRoom = existingRooms[0]

        const clientsToChange = new Set([...singleSet(existingRooms.map(room => this.byRoom(room))), ...new Set(clients)])
        
        this.clientsByRoom.set(survivorRoom, clientsToChange)

        clientsToChange.forEach(client => {
            if(client.room){
                client.socket.leave(client.room)
            }
            client.room = survivorRoom
            client.socket.join(client.room)
        })

        existingRooms.slice(1, ).forEach(room => {
            if(room!== survivorRoom){
                this.clientsByRoom.get(room).forEach(client => client.socket.leave(room))
                this.clientsByRoom.delete(room)
            }
        })
        return survivorRoom
    }

    createRoom(clients){
        let room = uuidv4()
        this.clientsByRoom.set(room, new Set(clients))
        clients.forEach(client => {
            client.room = room
            client.socket.join(room)
        })
        return room
    }

    leave(client){
        client = this.byId(client.id)
        let room = client.room
        let roomMembers = this.byRoom(room)
        roomMembers.delete(client)
        this.clientsByRoom.set(
            room,
            roomMembers
        )
        client.room = undefined
    }
}

