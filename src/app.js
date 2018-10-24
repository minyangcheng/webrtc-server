const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');

const app = express();
var privateKey = fs.readFileSync(path.resolve(__dirname, '../certificate/private.pem'), 'utf8');
var certificate = fs.readFileSync(path.resolve(__dirname, '../certificate/file.crt'), 'utf8');
var credentials = {key: privateKey, cert: certificate};


const httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
const io = socketIo(httpServer);
const ios = socketIo(httpsServer);

app.use(express.static(path.resolve(__dirname, '../public')));

httpServer.listen(8000, function () {
  console.log('listening on *:8000');
});
httpsServer.listen(8001, function () {
  console.log('listening on *:8001');
});

require('./socketHandler.js')(io);
require('./socketHandler.js')(ios);
