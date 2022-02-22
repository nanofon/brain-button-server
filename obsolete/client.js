export class Client{
    constructor(id, socket){
        this.id = id
        this.socket = socket
        this.name = undefined
        this.room = undefined
        this.isHost = false
        this.requestedHost= false
        this.winState = 'standby' // 'ready', 'won', 'lost', fahlstart
    }

    repr(){
        return {
            id:this.id,
            name:this.name,
            connected:this.socket.connected,
            isHost:this.isHost,
            requestedHost:this.requestedHost,
            winState:this.winState
        }
    }
}