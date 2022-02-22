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

    it('adds itself to the list of teams on connect', (done) => {
        let client = new ClientApp('test')
        client.socket.on('connect', () => {
            const teamIds = {}
            teamIds[client.id] = client.socket.id
            expect(client.teamIds).toEqual(teamIds)
            client.socket.disconnect()
            done()
        })
        client.socket.connect()
    })

    it('joins another client', (done) => {
        let client1 = new ClientApp('test');
        let client2 = new ClientApp('test');
        client1.socket.connect()
        client2.socket.connect()
        setTimeout(() => {
            expect(client1.teamIds).toHaveProperty(client1.id)
            expect(client2.teamIds).toHaveProperty(client2.id)
            client1.join(client2.teamIds);
            setTimeout(() => {
                expect(client1.teamIds).toHaveProperty(client2.id)
                expect(client2.teamIds).toHaveProperty(client1.id)
                client1.socket.disconnect()
                client2.socket.disconnect()
                done()
            }, TIMEOUT)
        }, TIMEOUT)
    }, Math.max(3*TIMEOUT, 5000));
});