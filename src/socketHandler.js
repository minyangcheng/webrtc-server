const util = require('util');
let io;
let userList = [];

module.exports = function (ioServer) {
  io = ioServer;
  io.on('connection', socket => {
    addUser(socket);
    handleEvent(socket);
    socket.on('disconnect', () => {
      deleteUser(socket);
    });
  });
}

function getUserList() {
  let users = [];
  userList.forEach(value => {
    users.push(value.id);
  });
  return users;
}

function addUser(socket) {
  console.log('add user ', socket.id)
  userList.push({id: socket.id, socket: socket});
  socket.emit('connectedEvent', socket.id);
  io.emit('userListEvent', getUserList());
}

function deleteUser(socket) {
  console.log('deleteUser user ', socket.id)
  let index = -1;
  for (let i = 0; i < userList.length; i++) {
    if (userList[i].id == socket.id) {
      index = i;
      break;
    }
  }
  if (index > -1) {
    userList.splice(index, 1);
    io.emit('userListEvent', getUserList());
  }
}

function handleEvent(socket) {

  socket.on('videoChatEvent', data => {
    let roomNo = 'aaa';
    socket.emit('generateRoomNoEvent', roomNo);
    io.to(data.toUser).emit('videoChatEvent', {roomNo, fromUser: data.fromUser});
  });

  socket.on('joinEvent', roomNo => {
    console.log('joinEvent :' + socket.id);
    socket.join(roomNo);
    io.to(roomNo).emit('peerEvent', '');
    socket.to(roomNo).emit('newPeerEvent', socket.id);
  })

  socket.on('rtcEvent', event => {
    socket.to(event.roomNo).emit('rtcEvent', event);
  })

}
