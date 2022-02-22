import ClientApp from '../client-app.js'
import server from '../server.js'
const TIMEOUT = 1

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
        setTimeout(() => {
            expect(client.socket.connected).toBe(false)
            client.disconnect()
            setTimeout(() => {
                expect(client.socket.connected).toBe(false)
                done()
            }, TIMEOUT)
        }, TIMEOUT)
        client.disconnect()
    });

    it('joins another client', (done) => {
        let client1 = new ClientApp('test');
        let client2 = new ClientApp('test');
        client1.join(client2.teamIds);
        expect(client1.teamIds).toEqual({...client1.teamIds, ...client2.teamIds})
        expect(client2.teamIds).toEqual({...client1.teamIds, ...client2.teamIds})
        done()
    });
});