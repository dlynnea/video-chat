const localVideo = document.querySelector('#local');
const remoteVideo = document.querySelector('#remote');
const open = document.querySelector('#start');
const connect = document.querySelector('#connect');
const close = document.querySelector("#close") ;

open.addEventListener('click', getLocalStream);
connect.addEventListener('click', getRemoteStream);
close.addEventListener('click', closeAllStreams);

let first;
let second;
let localStream;
let userMediaParams = { video: true }

function getLocalStream() {
    navigator.getUserMedia(userMediaParams, 
        handleUserMedia, handleUserMediaError
    )
}

function handleUserMedia(stream) {
    localVideo.srcObject = stream;
}

function handleUserMediaError(error) {
    console.error(`error: ${error}`);
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
        remoteVideo.srcObject === event.stream;
    }
}

function getConnection(conn) {
    return (conn === first) ? 'first' : 'second';
}

async function iceFunction(conn, event) {
    await conn.addIceCandidate(event.candidate);
    console.log(`${getConnection(conn)}`);
}

function closeAllStreams() {
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
}