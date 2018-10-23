const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.resolve(__dirname, '../public')));

http.listen(3000, function () {
  console.log('listening on *:3000');
});

require('./socketHandler.js')(io);