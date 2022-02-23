import ClientApp from '../client-app.js'
import server from '../server.js'
const TIMEOUT = 100

describe('Client app', () => {
    
    beforeAll((done) => {
        server.listen(3000);
        done();
    })

    afterAll((done) => {
        server.close(0);
        done();
    })

    it('initializes with itself in teams[]', () => {
        let client = new ClientApp('test')
        expect(client).toHaveProperty('id')
    });

    it('connects, disconnects', (done) => {
        let client = new ClientApp('test')
        client.socket.on('connect', () => {
            expect(client.socket.connected).toBe(true)
            client.socket.disconnect()
        })
        client.socket.on('disconnect', () => {
            expect(client.socket.connected).toBe(false)
            done()
        })
        client.socket.connect()
    });

    it('adds its socketId to teams on connect', (done) => {
        let client = new ClientApp('test')
        client.socket.on('connect', () => {
            expect(client.teams[client.id]).toHaveProperty('socketId')
            expect(client.teams[client.id].socketId).toEqual(client.socket.id)
            client.socket.disconnect()
            done()
        })
        client.socket.connect()
    });

    it('joins another client', (done) => {
        let client1 = new ClientApp('test');
        let client2 = new ClientApp('test');
        client1.socket.connect()
        client2.socket.connect()
        setTimeout(() => {
            expect(client1.teams).not.toHaveProperty(client2.id)
            expect(client2.teams).not.toHaveProperty(client1.id)
            client1.join(client2.qrIdSocketId);
            setTimeout(() => {
                expect(client1.teams).toHaveProperty(client2.id)
                expect(client2.teams).toHaveProperty(client1.id)
                expect(client1.teams[client2.id].socketId).toEqual(client2.socket.id)
                expect(client1.teams[client1.id].socketId).toEqual(client1.socket.id)
                client1.socket.disconnect()
                client2.socket.disconnect()
                done()
            }, TIMEOUT)
        }, TIMEOUT)
    }, Math.max(3*TIMEOUT, 5000));

    it('knows roommates, remembres when they disconnected', (done) => {
        let client1 = new ClientApp('test');
        let client2 = new ClientApp('test');
        client1.socket.connect()
        client2.socket.connect()
        setTimeout(() => {
            client1.join(client2.qrIdSocketId);
            setTimeout(() => {
                expect(client1.roomSockets).toContain(client2.socket.id)
                expect(client2.roomSockets).toContain(client1.socket.id)
                client2.socket.disconnect()
                setTimeout(() => {
                    expect(client1.roomSockets.length).toBe(2);
                    client1.socket.disconnect()
                    done();
                }, TIMEOUT)
            }, TIMEOUT)
        }, TIMEOUT)
    }, Math.max(4*TIMEOUT, 5000));

    it('informs room about name, status, socketId', (done) => {
        let client1 = new ClientApp('test');
        let client2 = new ClientApp('test');
        client1.socket.connect()
        client2.socket.connect()
        setTimeout(()=>{
            client1.join(client2.qrIdSocketId)
            setTimeout(() => {
                client1.inform(['name', 'status', 'socketId']);
                setTimeout(() => {
                    expect(client2.teams[client1.id].name).toEqual(client1.teams[client1.id].name);
                    expect(client2.teams[client1.id].status).toEqual(client1.teams[client1.id].status);
                    expect(client2.teams[client1.id].socketId).toEqual(client1.teams[client1.id].socketId);
                    client1.socket.disconnect()
                    client2.socket.disconnect()
                    done();
                }, TIMEOUT);
            }, TIMEOUT);
        }, TIMEOUT);
    }, Math.max(4*TIMEOUT, 5000));
});