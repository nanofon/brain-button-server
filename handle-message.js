export default function (io, event, message) {
    const data = JSON.parse(message)
    switch(event){
        case 'room update':
            Object.values(data).forEach(socketId => {
                io.to(socketId).emit('room update', message)
            })
            break;
        default:
            console.log(`Received "${event}" from "${socket.id}" with args: "${args}"`)
    }
}