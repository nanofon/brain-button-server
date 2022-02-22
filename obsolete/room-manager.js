import Clients from './clients.js'
import { Client } from './client.js'

export class RoomManager{
    constructor(io){
        this.clients = new Clients()
        this.io = io
    }
    
    onClientId(socket, clientId){
        let client = this.clients.byId(clientId)
        if(client){
            client.socket = socket
        } else {
            client = this.clients.add(new Client(clientId, socket))
        }
        if(client.room){
            client.socket.join(client.room)
            this.inform(client.room)
        }
    }

    join(socket, clientId){
        const room = this.clients.join([this.clients.bySocketId(socket.id), this.clients.byId(clientId)])
        this.inform(room)
    }

    inform(room){
        this.io.to(room).emit(
            'room update',
            JSON.stringify(
                Array.from(
                    this.clients.byRoom(room)
                ).map(
                    client => client.repr()
                )
            )
        )
    }

    onDisconnect(socket){
        const room = this.clients.bySocketId(socket.id).room
        if(room){
            this.inform(room)
        }
    }
}
