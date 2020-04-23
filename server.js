const express = require('express');
const app = express();
const port = process.env.PORT || 9000;
const httpServer = app.listen(port, () => console.log(`listening on port ${port}`));

const socketio = require('socket.io');
const io = socketio(httpServer);
const p2p = require('socket.io-p2p-server').Server;
io.use(p2p);


app.use(express.static(__dirname + '/videoChat'));
app.get('/', (res, req) => res.render('index.html'));

io.on('connection', handleSocket);

function handleSocket(socket) {
    socket.on('open', (message) => console.log(message))
    socket.emit('welcome', 'Hello Human')
    socket.on('offer', (offer, offerPC) => socket.emit('offer', offer, offerPC));
    socket.on('answer', (answer, answerPC) => socket.emit('answer', answer, answerPC))
}
