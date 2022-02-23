import ClientApp from '../client-app.js'
import server from '../server.js'
const TIMEOUT = 65

let clients = []

const joinAllClients = () => {
    clients.slice(1,).forEach(client => {
        client.join(clients[0].qrIdSocketId);
    });
};

describe('Client app', () => {
    
    beforeAll((done) => {
        server.listen(3000);
        setTimeout(done, TIMEOUT);
    });

    afterAll((done) => {
        server.close(0);
        setTimeout(done, TIMEOUT);
    });

    beforeEach((done) => {
        for(let i=0; i<2; i++){
            clients.push(new ClientApp('test'));
        }
        clients.forEach(client => client.socket.connect());
        setTimeout(done, TIMEOUT);
    });

    afterEach((done) => {
        clients.forEach(client => client.socket.disconnect());
        clients.length = 0;
        setTimeout(done, TIMEOUT);
    });

    it('initializes with itself in teams[]', () => {
        expect(clients[0]).toHaveProperty('id');
    });

    it('connects, disconnects', (done) => {
        expect(clients[0].socket.connected).toBe(true);
        clients[0].socket.on('disconnect', () => {
            expect(clients[0].socket.connected).toBe(false);
            done();
        });
        clients[0].socket.disconnect();
    });

    it('adds its socketId to teams on connect', () => {
        expect(clients[0].teams[clients[0].id]).toHaveProperty('socketId');
        expect(clients[0].teams[clients[0].id].socketId).toEqual(clients[0].socket.id);
    });

    it('joins another client', (done) => {
        expect(clients[0].teams).not.toHaveProperty(clients[1].id)
        expect(clients[1].teams).not.toHaveProperty(clients[0].id)
        clients[0].join(clients[1].qrIdSocketId);
        setTimeout(() => {
            expect(clients[0].teams).toHaveProperty(clients[1].id)
            expect(clients[1].teams).toHaveProperty(clients[0].id)
            expect(clients[0].teams[clients[1].id].socketId).toEqual(clients[1].socket.id)
            expect(clients[1].teams[clients[0].id].socketId).toEqual(clients[0].socket.id)
            done()
        }, TIMEOUT)
    }, Math.max(2*TIMEOUT, 5000));

    it('knows roommates, remembers when they disconnected', (done) => {
        joinAllClients()
        setTimeout(() => {
            expect(clients[0].roomSockets).toContain(clients[1].socket.id);
            expect(clients[1].roomSockets).toContain(clients[0].socket.id);
            clients[1].socket.disconnect()
            setTimeout(() => {
                expect(clients[0].roomSockets.length).toBe(2);
                done();
            }, TIMEOUT)
        }, TIMEOUT)
    }, Math.max(3*TIMEOUT, 5000));

    it('informs room about name, status, socketId', (done) => {
        joinAllClients()
        setTimeout(() => {
            expect(clients[1].teams[clients[0].id].name).toEqual(clients[0].teams[clients[0].id].name);
            expect(clients[1].teams[clients[0].id].status).toEqual(clients[0].teams[clients[0].id].status);
            expect(clients[1].teams[clients[0].id].socketId).toEqual(clients[0].teams[clients[0].id].socketId);
            done();
        }, TIMEOUT);
    }, Math.max(3*TIMEOUT, 5000));

    it('becomes host if nobody else is', (done) => {
        joinAllClients();
        setTimeout(()=>{
            client[0].claimHost()
        }, TIMEOUT);
    });
});