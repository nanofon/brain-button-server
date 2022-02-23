import { v4 as uuidv4 } from 'uuid'
import { io } from "socket.io-client";
import LZString from 'lz-string';

export default class ClientApp{

    constructor(test = false){
        this.id = uuidv4(); // should retrieve from a storage
        this.socket = io("ws://localhost:3000", {autoConnect: test !== 'test'});

        this.teams = {};
        this.updateTeamValue(this.id, {
            'name':uuidv4(),
            'status':1
        });
        
        this.socket.on('connect', () => {
            this.updateTeamValue(this.id, {'socketId':this.socket.id});
        });

        this.socket.on('teams update', (message) => {
            Object.entries(message).forEach(([id, team]) => {
                this.updateTeamValue(id, team);
            });
        });
    };

    get qrIdSocketId(){
        return JSON.stringify(
            Object.fromEntries(
                Object.keys(this.teams)
                .map(id => [id, {'socketId':this.teams[id]['socketId']}])
            )
        );
    }
    get roomSockets(){
        return Object.values(this.teams).map(team => team.socketId)
    }

    updateTeamValue(id, mapping){
        if(!(id in this.teams)){this.teams[id] = {}}
        for (const [key, value] of Object.entries(mapping)){
            this.teams[id][key] = value;
        }
    }

    join(qrIdSocketId){
        const mapping = Object.assign(JSON.parse(qrIdSocketId), JSON.parse(this.qrIdSocketId))
        const obj = {}
        obj["to"] = Object.values(mapping).map(team => team.socketId)
        obj["data"] = mapping
        this.socket.emit("teams update", obj)
    }

    inform(topics){
        const team = this.teams[this.id] //{name:string, socketId}
        const data = {}
        data[this.id] = {}
        topics.forEach(topic => data[this.id][topic] = team[topic])
        let message = {
            "to":this.roomSockets,
            "data":data         //{id:{name:string, socketId:string, ...}}
        }
        this.socket.emit('teams update', message)
    }
}

// message = {
//    to: [socketId, ],
//    data: {
//      teamId: {
//          socketId:socketId,
//          name:name,
//          ...
//      },
//    ...
// }