const localVideo = document.querySelector('#local');
const remoteVideo = document.querySelector('#remote');
const open = document.querySelector('#start');
const connect = document.querySelector('#connect');
const close = document.querySelector("#close");
const goPrivate = document.querySelector("#go-private");

const socket = io();
const P2P = require('socket.io-p2p');
const p2p = new P2P(socket);

socket.on('welcome', (message) => console.log(message));

socket.emit('open', 'we in!');

p2p.on('peer-msg', function (data) {
  console.log('From a peer %s', data);
});

p2p.on('go-private', function (message) {
    console.log(message);
});

goPrivate.addEventListener('click', () => p2p.upgrade());


open.addEventListener('click', getLocalStream);
connect.addEventListener('click', getRemoteStream);
close.addEventListener('click', closeAllStreams);

let offerPC, answerPC, localStream;
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
    offerPC = new RTCPeerConnection();
    offerPC.addEventListener('icecandidate', event => whenIceCandidate(event, answerPC, "one"));

    answerPC = new RTCPeerConnection();
    answerPC.addEventListener('icecandidate', event => whenIceCandidate(event, offerPC, "two"));
    answerPC.addEventListener('addstream', addStream);

    localStream.getTracks().forEach(track => offerPC.addTrack(track, localStream));
    
    const offer = await offerPC.createOffer({ offerToReceiveVideo: true });

    p2p.emit('offer', offer, offerPC);

    socket.on('offer', async offer => {
        console.log('answerPC on offer')
        await answerPC.setRemoteDescription(offer);
        await offerPC.setLocalDescription(offer);
        const answer = await answerPC.createAnswer();
        socket.emit('answer', answer);
    });

    socket.on('answer', async answer => {
        console.log('offerPC on answer')
        await answerPC.setLocalDescription(answer);
        await offerPC.setRemoteDescription(answer);
    });
}

function addStream(event) {
    if(remoteVideo.srcObject !== event.stream) {
        remoteVideo.srcObject = event.stream;
    }
}

function getConnection(connection) {
    return connection === offerPC ? 'offerPC' : 'answerPC';
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
    offerPC.close();
    answerPC.close();
    offerPC = null;
    answerPC = null;
}