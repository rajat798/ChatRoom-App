const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//get Username and Room
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix : true
})

console.log(username, room)

const socket = io()


//Join Room
socket.emit('joinRoom' , {username, room})

// Add roomname to DOM
function outputRoomName(room){
    roomName.innerText = room
}

//Add users to DOM
function outputUsers(users) {
    userList.innerHTML = ''
    users.forEach(user => {
        const li = document.createElement('li')
        li.innerText = user.username
        userList.appendChild(li)
    })       
}

//get Room and Users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})



//Output Message to DOM
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div)
}

//Message from Server
socket.on('message', message => {
    console.log(message)
    outputMessage(message)

    //Scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight
})


chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // get Message text
    const msg = e.target.elements.msg.value
    // console.log(msg)
    //Emitting a msg to server
    socket.emit('chatMessage', msg)
    //Clear Input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

