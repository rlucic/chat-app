//Core modules
const path = require('path')
const http = require('http')

//Other modules
const express = require('express')
const sockeio = require('socket.io')

const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '../public')
//console.log(publicPath)

//different way to set up express to work with WebSockets
const app = express()
const server = http.createServer(app)
//socket.io needs a pure http server
const io = sockeio(server)

app.use(express.static(publicPath))

let count = 0
//configure socket.io to listen to the 'connection' event
io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    socket.emit('countUpdated', count)

    //listen for the 'increment' event from the client
    socket.on('increment', () => {
        count++
        //send back the new value of the counter
        //socket.emit('countUpdated', count)
        //next line emits to all clients connected!!!
        io.emit('countUpdated', count)
    })

})
//user server here instead of app
server.listen(port, () => {
    console.log(`listens to port ${port}`)
})

