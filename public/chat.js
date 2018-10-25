var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

var roomNo;
var pc;
var socketId;
var iceServer = {
    'iceServers': [
      {
        credential: "mytest",
        username: "12345678",
        urls: "turn:39.107.240.238:3478"
      },
      {
        urls: "stun:39.107.240.238:3478"
      }
    ]
  }
;

var socket = io();

socket.on('connectedEvent', () => {
  console.log('用户上线id-connectedEvent:', socket.id);
  socketId = socket.id;
  document.title = socket.id;
});
socket.on('userListEvent', function (data) {
  console.log('当前用户列表-userListEvent:', data);
  refreshUserList & refreshUserList(data);
});
socket.on('generateRoomNoEvent', function (data) {
  console.log('生成房间号-generateRoomNoEvent:', data);
  roomNo = data;
  socket.emit('joinEvent', roomNo);
});
socket.on('videoChatEvent', function (data) {
  console.log('接收到聊天邀请-videoChatEvent:', data);
  roomNo = data.roomNo;
  if (confirm('是否接受聊天邀请')) {
    doAnswer();
  } else {
    doReject();
  }
});
socket.on('agreeEvent', function (data) {
  console.log('对方同意开启聊天-agreeEvent:', data);
  offer();
});

socket.on('rtcEvent', function (event) {
  if (event.type === 'offer') {
    console.log('收到offer sessionDescription：',event.sessionDescription)
    answer();
    pc.setRemoteDescription(new RTCSessionDescription(event.sessionDescription));
  } else if (event.type === 'answer') {
    console.log('收到answer sessionDescription：',event.sessionDescription)
    pc.setRemoteDescription(new RTCSessionDescription(event.sessionDescription));
  } else if (event.type === 'candidate') {
    console.log('收到candidate：',event.candidate)
    var candidate = new RTCIceCandidate({
      candidate: event.candidate
    });
    pc.addIceCandidate(candidate);
  }
});

socket.on('rejectEvent', function () {
  console.log('视频聊天被拒绝');
  socket.emit('leaveEvent', roomNo);
  alert('视频聊天被拒绝');
});

socket.on('hangUpEvent', function () {
  socket.emit('leaveEvent', roomNo);
  console.log('视频聊天被挂断');
  stop();
  alert('视频聊天被挂断');
});

function doCall(toUser) {
  console.log('发起视频聊天');
  socket.emit('videoChatEvent', {fromUser: socketId, toUser: toUser});
}

function doAnswer() {
  console.log('同意视频聊天');
  socket.emit('joinEvent', roomNo);
}

function doReject() {
  console.log('拒绝视频聊天');
  socket.emit('rejectEvent', roomNo);
}

function doHangUp() {
  console.log('挂断视频聊天');
  socket.emit('hangUpEvent', roomNo);
}

function stop() {
  pc.close();
  pc = null;
}

function offer() {
  console.log('创建RTCPeerConnection');
  createRTCPeerConnection();
  getMedia(function () {
    pc.createOffer(sendOfferFn, offerOrAnswerErrorFn);
  });
}

function answer() {
  console.log('创建RTCPeerConnection');
  createRTCPeerConnection();
  getMedia(function () {
    pc.createAnswer(sendAnswerFn, offerOrAnswerErrorFn);
  });
}

function createRTCPeerConnection() {
  pc = new RTCPeerConnection(iceServer);
  pc.onicecandidate = function (event) {
    if (!event.candidate) {
      return;
    }
    console.log('创建并发送- candidate:', event.candidate);
    socket.emit('rtcEvent', {
      'roomNo': roomNo,
      type: 'candidate',
      candidate: event.candidate.candidate
    });
  };
  pc.onaddstream = function (event) {
    console.log('播放远程视频流');
    // remoteVideo.srcObject = event.stream;
    remoteVideo.src = URL.createObjectURL(event.stream);
  };
  pc.onremovestream = function (event) {
    console.log('onremovestream. Event: ', event);
  };
}

function getMedia(callback) {
  navigator.getUserMedia({
    audio: true,
    video: true
  }, function (stream) {
    console.log('播放本地视频流');
    localVideo.srcObject = stream;
    pc.addStream(stream);
    callback();
  }, function (error) {
    alert('您的浏览器不支持视频聊天');
  })
}

function sendOfferFn(sessionDescription) {
  console.log('创建并发送- sessionDescription:', sessionDescription);
  pc.setLocalDescription(sessionDescription);
  socket.emit('rtcEvent', {
    'roomNo': roomNo,
    'type': 'offer',
    'sessionDescription': sessionDescription
  });
};

function sendAnswerFn(sessionDescription) {
  console.log('创建并发送- sessionDescription:', sessionDescription);
  pc.setLocalDescription(sessionDescription);
  socket.emit('rtcEvent', {
    'roomNo': roomNo,
    'type': 'answer',
    'sessionDescription': sessionDescription
  });
};

function offerOrAnswerErrorFn(error) {
  console.log('offerOrAnswerErrorFn: ', error);
};
