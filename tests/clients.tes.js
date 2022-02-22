import { Client } from '../client.js';
import Clients from '../clients.js'

const generateClient = (id, socketId) => {
    return new Client(id, {
        id:socketId,
        join(room){},//console.log(`joined ${room}`)},
        leave(room){}//console.log(`left ${room}`)}
    })
}

describe('Clients', ()=>{
    let clients;
    beforeEach(() => {clients = new Clients()})

    it('initializes', () => {
        expect(clients.clientById).toEqual(new Map())
        expect(clients.clientBySocketId).toEqual(new Map())
        expect(clients.clientsByRoom).toEqual(new Map())
    });

    it('adds new client', () => {
        let id = "anyid"
        let socketId = "anySocketId"
        let client = generateClient(id, socketId)
        clients.add(client)
        expect(clients.byId(id)).toBe(client)
        expect(clients.bySocketId(socketId)).toBe(client)
    });
    
    it('adds 2 clients, joins them', () => {
        let client1 = generateClient("id1", "socketId1")
        let client2 = generateClient("id2", "socketId2")
        clients.add(client1)
        clients.add(client2)
        clients.join([client1, client2])
        expect(client1.room).toEqual(client2.room)
    });

    it('joins 3rd client to the room of 2', () => {
        let client1 = generateClient("id1", "socketId1")
        let client2 = generateClient("id2", "socketId2")
        let client3 = generateClient("id3", "socketId3")
        clients.add(client1)
        clients.add(client2)
        clients.add(client3)
        clients.join([client1, client2])
        let survivorRoom = client1.room
        clients.join([client1, client3])
        expect(client3.room).toEqual(survivorRoom)
        expect(clients.byRoom(survivorRoom)).toContain(client1)
        expect(clients.byRoom(survivorRoom)).toContain(client2)
        expect(clients.byRoom(survivorRoom)).toContain(client3)
    });

    it('overwrites the less populated room', ()=>{
        let client1 = generateClient("id1", "socketId1")
        let client2 = generateClient("id2", "socketId2")
        let client3 = generateClient("id3", "socketId3")
        let client4 = generateClient("id4", "socketId4")
        let client5 = generateClient("id5", "socketId5")
        clients.add(client1)
        clients.add(client2)
        clients.add(client3)
        clients.add(client4)
        clients.add(client5)
        clients.join([client1, client2])
        clients.join([client3, client4, client5])
        let extinctRoom = client1.room
        let survivorRoom = client3.room
        expect(extinctRoom).not.toEqual(survivorRoom)
        clients.join([client1, client3])
        expect(client1.room).toEqual(survivorRoom)
        expect(clients.byRoom(survivorRoom)).toContain(client1)
        expect(clients.byRoom(survivorRoom)).toContain(client5)
        expect(clients.clientsByRoom.keys()).not.toContain(extinctRoom)
    });

    it('leaves the room', () => {
        let client1 = generateClient("id1", "socketId1")
        let client2 = generateClient("id2", "socketId2")
        clients.add(client1)
        clients.add(client2)
        clients.join([client1, client2])
        expect(clients.byRoom(client1.room)).toContain(client2)
        clients.leave(client2)
        expect(client2.room).not.toEqual(client1.room)
        expect(clients.byRoom(client1.room)).not.toContain(client2)
    })

})