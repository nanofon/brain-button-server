export default function (io, event, message) {
    const data = JSON.parse(message)
    switch(event){
        case 'room update':
            Object.values(data).forEach(socketId => {
                io.to(socketId).emit('room update', message)
            })
            break;
        case 'name':
            Object.values(data.to).forEach(socketId => {
                io.to(socketId).emit('name', JSON.stringify(data.data))
            })
            break;
        case 'status':
            Object.values(data.to).forEach(socketId => {
                io.to(socketId).emit('status', JSON.stringify(data.data))
            })
            break;
        case 'online':
            Object.values(data.to).forEach(socketId => {
                io.to(socketId).emit('online', JSON.stringify(data.data))
            })
            break;
        default:
            console.log(`Received "${event}" with args: "${message}"`)
    }
}