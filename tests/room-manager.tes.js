import { RoomManager } from '../obsolete/room-manager.js'
import { Client } from '../obsolete/client.js'

const mockClient = (clientId, socketId) => {
    return new Client(clientId, {
        id:socketId,
        join:jest.fn(),
        leave:jest.fn()
    })
}

const mockIo = {}

describe('Room Manager', ()=>{
    let rm;
    beforeEach(() => {
        rm = new RoomManager(mockIo)
        rm.inform = jest.fn()
    })

    it('accepts new unknown client id', () => {
        let client = mockClient("anyClientId", "anySocketId")
        rm.onClientId(client.socket, client.id)
        expect(rm.clients.byId(client.id)).toEqual(client)
        expect(rm.clients.byId(client.id).socket.id).toEqual(client.socket.id)
    });

    it('on join request joins and informs', () => {
        let client1 = mockClient("1", "10")
        let client2 = mockClient("2", "20")
        rm.onClientId(client1.socket, client1.id)
        rm.onClientId(client2.socket, client2.id)
        rm.join(client1.socket, client2.id)
        expect(rm.clients.byId(client1.id).room).toEqual(rm.clients.byId(client2.id).room)
        expect(rm.inform).toHaveBeenCalledTimes(1)
        let client3 = mockClient("3", "30")
        rm.onClientId(client3.socket, client3.id)
        rm.join(client3.socket, client2.id)
        expect(rm.inform).toHaveBeenCalledTimes(2)
    });

    it('accepts host request if no other host in the room', () => {
        let client1 = mockClient("1", "10")
        rm.onClientId(client1.socket, client1.id)
        rm.onHostRequest(client1.socket.id)
        expect(rm.clients.host())
    });

})