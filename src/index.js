//Core modules
const path = require('path')
const http = require('http')

//Other modules
const express = require('express')
const sockeio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage} = require('./utils/messages')

//// end loading modules ////

const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '../public')
//console.log(publicPath)

//different way to set up express to work with WebSockets
const app = express()
const server = http.createServer(app)
//socket.io needs a pure http server
const io = sockeio(server)

app.use(express.static(publicPath))

/**
 * Sending messages:
 * in general:
 *     socket.emit,      io.emit,       socket.broadcast.emit
 * for a chat room:
 *                       io.to.emit     socket.broadcast.to().emit
 */


//configure socket.io to listen to the 'connection' event
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({username, room}) => {
        //join that specific room
        socket.join(room)

        socket.emit('message', generateMessage('Welcome'))
        //send a message to all users except this one
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joned`))
    })


    socket.on('sendMessage', (message, callback)=> {
        
        const filter = new Filter()
        if(filter.isProfane(message)){
            //if it is a profane message, it will not be delivered to the rest
            return callback('Profane message, not delivered.')
        }
        //need access to the room name for the user
        io.to('r1').emit('message', generateMessage(message))
        //call the callback fct to let the emitter know that the message was received
        callback()
    })
    
    socket.on('sendLocation', (location, locationCallback) => {
        //console.log(`lat: ${location.latitude}, long: ${location.longitude}`)
        //io.emit('message', `Location: ${location.latitude}, ${location.longitude}`)
        io.emit('sendLocation', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        locationCallback()
    })


    socket.on('disconnect', () => [
        io.emit('message', generateMessage('A user has left'))
    ])
})

//user server here instead of app
server.listen(port, () => {
    console.log(`listens to port ${port}`)
})

