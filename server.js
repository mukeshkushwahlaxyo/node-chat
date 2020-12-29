const path = require('path');
const express = require('express');
const redis = require('redis');
const session = require('express-session');
var cookieParser = require('cookie-parser');
let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient();
// var cookieSession = require('cookie-session')
const http = require('http')
const socketio = require('socket.io')
const formateMessage = require('./utils/messages')
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users')
const indexRouter = require('./routes/index');
var cors = require('cors');

const app = express();
app.use(cors({
	credentials: true,
}))

app.use(
  session({
    secret: 'notsoimportantsecret', 
     name: "secretname", 
     resave:true,
     saveUninitialized:true,
     cookie: {
      httpOnly: false,
      secure: !true,
      //sameSite: true,
      expires: false // Time is in miliseconds
  },
    store: new RedisStore({ client: redisClient,host: 'localhost', port: 3000, ttl: 86400}),   
    resave: false
  })
)

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content type, Authorization, Accept');
    next();
});

app.set('trust proxy', 1)


// app.use(cookieSession({
//   name: 'session',
//   keys: ['key1', 'key2']
// }))

// app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));

const server = http.createServer(app)
const io = socketio(server)
const qs = require('qs');

const PORT = 3000 || process.env.PORT;

const boatName = 'Mukesh'
//Static path
// app.use(express.static(path.join(__dirname,'public')));
app.use('/', indexRouter);
// app.use('/users', usersRouter);




io.on('connection',socket =>{

	socket.on('joinRoom',({username,room})=>{
		const user = userJoin(socket.id,username,room)

		socket.join(user.room)
		//for catch new message
		socket.emit('message',formateMessage(user.username,'Welcome To Chat...........'));
		//for catch new join user
		socket.broadcast.to(user.room).emit('message',formateMessage(boatName,`${user.username} has join the Chat...`))

		io.to(user.room).emit('roomUser',{
			room:user.room,
			users:getRoomUsers(user.room)
		}) 

	})

	

	socket.on('chatMessage',msg =>{
		io.on('error', function(){
		  socket.socket.reconnect();
		});
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