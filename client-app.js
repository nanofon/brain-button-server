import { v4 as uuidv4 } from 'uuid'
import { io } from "socket.io-client";

export default class ClientApp{

    constructor(test = false){
        this.id = uuidv4();
        this.name = uuidv4();
        this.status = 1;
        this.socket = io("ws://localhost:3000", {autoConnect: test !== 'test'});

        this.teamIds = {}
        
        this.socket.on('connect', () => {
            this.teamIds[this.id] = this.socket.id;
        });
        this.socket.on('room update', (teamIds) => {
            this.teamIds = teamIds
        })
    }

    disconnect(){this.socket.close()}

    join(otherTeamIds){
        const teamIds = Object.assign(this.teamIds, otherTeamIds)
        this.socket.emit("room update", teamIds)
    }
}