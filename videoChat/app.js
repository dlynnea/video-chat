const localVideo = document.querySelector('#local');
const remoteVideo = document.querySelector('#remote');
const open = document.querySelector('#start');
const connect = document.querySelector('#connect');
const close = document.querySelector("#close");

const socket = io('http://localhost:9000');

socket.on('welcome', (message) => console.log(message));

socket.emit('open', 'we in!');

open.addEventListener('click', getLocalStream);
connect.addEventListener('click', getRemoteStream);
close.addEventListener('click', closeAllStreams);

let first, second, localStream;
let userMediaParams = { video: true }

function getLocalStream() {
    navigator.getUserMedia(userMediaParams, 
        handleUserMedia, handleUserMediaError
    )
}

function handleUserMedia(stream) {
    localStream = stream;
    localVideo.srcObject = stream;
}

function handleUserMediaError(error) {
    console.error(`error: ${error}`);
}

async function getRemoteStream() {
    first = new RTCPeerConnection();
    first.addEventListener('icecandidate', event => whenIceCandidate(event, second, "one"));

    second = new RTCPeerConnection();
    second.addEventListener('icecandidate', event => whenIceCandidate(event, first, "two"));
    second.addEventListener('addstream', addStream);

    localStream.getTracks().forEach(track => first.addTrack(track, localStream));
    
    const offer = await first.createOffer({ offerToReceiveVideo: true });
    await first.setLocalDescription(offer);
    await second.setRemoteDescription(offer);

    const answer = await second.createAnswer();
    await second.setLocalDescription(answer);
    await first.setRemoteDescription(answer);
}

function addStream(event) {
    if(remoteVideo.srcObject !== event.stream) {
        remoteVideo.srcObject = event.stream;
    }
}


function getConnection(connection) {
    return connection === first ? 'first' : 'second';
}

async function whenIceCandidate(event, connection, number) {
    console.log("number:", number);
    await connection.addIceCandidate(event.candidate);
    console.log(`Peer: ${ getConnection(connection) }.`);
    console.log(`${ event.candidate ? event.candidate.candidate : "who could know?" }`);
}

function closeAllStreams() {
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    first.close();
    second.close();
    first = null;
    second = null;
}