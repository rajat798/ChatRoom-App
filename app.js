const express = require('express')
const app = express()
const http = require('http')
const path  = require('path')

const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeaves, getRoomUsers} = require('./utils/users')

const PORT = process.env.PORT || 7777
const server = http.createServer(app)

//Socket IO set up
const io = require('socket.io')(server)

const botName = 'ChatRoom Bot'

//Static Folder SetUp
app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', socket => {
    // console.log("New WebSocket Connection")

    socket.on('joinRoom' , ({username, room}) => {

        const user= userJoin(socket.id, username, room) 

        socket.join(user.room)

        //Welcome Current User
        socket.emit('message',formatMessage(botName,'Welcome to ChatRoom'))

        //Broadcast to users other than the user that is joining
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`))

        //Get room info
        io.to(user.room).emit('roomUsers', {
            room : user.room,
            users : getRoomUsers(user.room)
        })

    })

    


    //Listen for chatMessage
    socket.on('chatMessage',msg => {
        const user = getCurrentUser(socket.id)
        // console.log(msg)
        io.to(user.room).emit('message',formatMessage(user.username, msg))
    })

    //When user disconnects
    socket.on('disconnect', () => {
        const user = userLeaves(socket.id)

        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`)) // message to everyone
        }

        //Get room info
        io.to(user.room).emit('roomUsers', {
            room : user.room,
            users : getRoomUsers(user.room)
        })
    })
})


server.listen(PORT, () => console.log(`Server is running on PORT : ${PORT}`))
