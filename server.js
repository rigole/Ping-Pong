const app = require('./app');
const server = require('http').createServer();
const io = require('socket.io')(server , {
    cors: {
        origin: '*',
    }
})

const PORT = 3000;

server.listen(PORT);
console.log(`Listening on port ${PORT}...`);

let readyPlayCount = 0;

io.on('connection', (socket) => {
    console.log("A user connected", socket.id);

    socket.on('ready', () => {
        console.log("Player Ready", socket.id);

        readyPlayCount++;

        if (readyPlayCount === 2){

            io.emit('startGame', socket.id);
        }
    })
})