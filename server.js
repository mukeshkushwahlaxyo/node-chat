const path = require('path');
const express = require('express');
const http = require('http')
const socketio = require('socket.io')
const formateMessage = require('./utils/messages')
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)
const qs = require('qs');

const PORT = 3000 || process.env.PORT;

const boatName = 'Mukesh'
//Static path
app.use(express.static(path.join(__dirname,'public')));

io.on('connection',socket =>{

	socket.on('joinRoom',({username,room})=>{
		const user = userJoin(socket.id,username,room)

		socket.join(user.room)
		//for catch new message
		socket.emit('message',formateMessage(user.username,'Welcome To Chat'));
		//for catch new join user
		socket.broadcast.to(user.room).emit('message',formateMessage(boatName,`${user.username} has join the Chat...`))

		io.to(user.room).emit('roomUser',{
			room:user.room,
			users:getRoomUsers(user.room)
		}) 

	})

	

	socket.on('chatMessage',msg =>{
		const user = getCurrentUser(socket.id)
		io.emit('message',formateMessage(user.username,msg))
	})

	//for left chat room
	socket.on('disconnect',() =>{
		const user = userLeave(socket.id)		
		if(user){
			io.to(user.room).emit('message',formateMessage(boatName,`${user.username} left the room.....`))
			io.to(user.room).emit('roomUser',{
			room:user.room,
			users:getRoomUsers(user.room)
		}) 
		}


	})

})



server.listen(PORT, () => console.log(`Server is runing on..... ${PORT}`));