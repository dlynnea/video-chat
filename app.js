const localVideo = document.querySelector('#local');
const remoteVideo = document.querySelector('#remote');
const open = document.querySelector('#start');
const connect = document.querySelector('#connect');

open.addEventListener('click', getLocalStream);
connect.addEventListent('click', getRemoteStream);

let first;
let second;
let localStream;

function getLocalStream() {
    navigator.getUserMedia({
        video: true,
        audio: true
    }, function(stream) {
        localVideo.srcObject = stream;
    }, function(err) {
        console.error(`error: ${err}`);
    });
}

function getRemoteStream() {
    first = new RTCPeerConnection();
    first.addEventListener('icecandidate', event => iceFunction(second, event));

    second = new RTCPeerConnection();
    second.addEventListener('icecandidate', event => iceFunction(first, event));
    second.addEventListener('addstream', event => addStream);
}

function addStream(event) {
    if(remoteVideo !== event.stream) {
        remoteVideo.srcObject === event.stream
    }
}

function getConnection(conn) {
    return (conn === first) ? 'first' : 'second';
}

async function iceFunction(conn, event) {
    await conn.addIceCandidate(event.candidate);
    console.log(`${getConnection(conn)}`)
}