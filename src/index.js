//Core modules
const path = require('path')
const http = require('http')

//Other modules
const express = require('express')
const sockeio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


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
 *                       io.to().emit     socket.broadcast.to().emit
 */


//configure socket.io to listen to the 'connection' event
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({username, room}, joinCallback) => {

        //addUser returns an object with either error or an user property, use destructuring to get that populated
        const {error, user} = addUser({id: socket.id, username: username, room: room})

        //check if an error was retruned (user = undefined)
        if(error){
            return joinCallback(error)
        }

        //join that specific room
        socket.join(user.room)

        socket.emit('message', generateMessage(`Admin of ${user.room}`,`Welcome ${user.username}`))
        //send a message to all users except this one in the same room
        socket.broadcast.to(user.room).emit('message', generateMessage(`Admin of ${user.room}`, `${user.username} has joned`))
        //emit an event to all in the room when a user joins (used to populate the right bar)
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        joinCallback()
    })


    socket.on('sendMessage', (message, callback)=> {
        
        const filter = new Filter()
        if(filter.isProfane(message)){
            //if it is a profane message, it will not be delivered to the rest
            return callback('Profane message, not delivered.')
        }

        const user = getUser(socket.id)

        //need access to the room name for the user
        io.to(user.room).emit('message', generateMessage(user.username, message))
        //call the callback function to let the emitter know that the message was received
        callback()
    })
    
    socket.on('sendLocation', (location, locationCallback) => {
        //console.log(`lat: ${location.latitude}, long: ${location.longitude}`)
        //io.emit('message', `Location: ${location.latitude}, ${location.longitude}`)
        const user = getUser(socket.id)
        console.log(user)
        io.to(user.room).emit('sendLocation', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        locationCallback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(`Admin of ${user.room}`, `${user.username} has left the room.`))
            //update room content and send an event 
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

//user server here instead of app
server.listen(port, () => {
    console.log(`listens to port ${port}`)
})

