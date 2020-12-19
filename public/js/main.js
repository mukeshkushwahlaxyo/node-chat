const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const {username,room} = Qs.parse(location.search,{
  ignoreQueryPrefix:true
});


var socket = io()

socket.emit('joinRoom',{username,room});

socket.on('roomUser' , ({room,users}) => {
  // console.log(users)
  outputRoomName(room)
  outputUsers(users)
})

socket.on('message',message => {
  updateMessage(message)
  
  chatMessages.scrollTop = chatMessages.scrollHeight

})

//Get dat form input field
chatForm.addEventListener('submit', e =>{
  e.preventDefault()
  //get message
  const msg = e.target.elements.msg.value

  //send message to server
  socket.emit('chatMessage',msg);
  //clear input
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()

})

function updateMessage(message){

  const div = document.createElement('div')
  div.classList.add('message');
  div.innerHTML = `<p class='meta'>${message.username} <span>${message.time}</span></p><p class='text'>${message.text}</p>`;
  document.querySelector('.chat-messages').appendChild(div)
}

function outputRoomName(room){
  roomName.innerText = room;
}

 function outputUsers(users){
  userList.innerHTML = `
      ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
 }