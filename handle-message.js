export default function (io, event, data) {
    switch(event){
        case 'room update':
            Object.entries(data).forEach((id, socketId) => {
                io.to(socketId).emit('room update', data)
            })
            break;
        default:
            console.log(`Received "${event}" from "${socket.id}" with args: "${args}"`)
    }
}