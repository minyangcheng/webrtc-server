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
  return userList;
}

function addUser(socket) {
  console.log('add user ', socket.id);
  userList.push(socket.id);
  socket.emit('connectedEvent', socket.id);
  io.emit('userListEvent', getUserList(socket));
}

function deleteUser(socket) {
  console.log('deleteUser user ', socket.id)
  let index = userList.indexOf(socket.id);
  if (index > -1) {
    userList.splice(index, 1);
  }
  io.emit('userListEvent', getUserList());
}

function handleEvent(socket) {

  socket.on('videoChatEvent', data => {
    let roomNo = Date.now();
    socket.emit('generateRoomNoEvent', roomNo);
    socket.to(data.toUser).emit('videoChatEvent', {roomNo, fromUser: data.fromUser});
  });

  socket.on('joinEvent', roomNo => {
    socket.join(roomNo);
    io.to(roomNo).emit('peerEvent', '');
    socket.to(roomNo).emit('newPeerEvent', socket.id);
  })

  socket.on('leaveEvent', roomNo => {
    socket.leave(roomNo);
  })

  socket.on('rtcEvent', event => {
    socket.to(event.roomNo).emit('rtcEvent', event);
  })

  socket.on('rejectEvent', roomNo => {
    socket.to(roomNo).emit('rejectEvent');
  })

  socket.on('hangUpEvent', roomNo => {
    io.to(roomNo).emit('hangUpEvent');
  })

}
