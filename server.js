import express from 'express'
import http from 'http'
import socketClusterServer from 'socketcluster-server'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import createGame from './game.js'

const game = createGame();
const hold = {}
setInterval(
		()=>{
			game.addThing({type:"fruits"})
			sockets.exchange.transmitPublish('game', game.getState());
		},
		1000
);

const app = express()
let server = http.createServer(app)
let sockets = socketClusterServer.attach(server)

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.post('/jogo', (req, res)=>{
	res.redirect('/jogo/jogo.html')
});

(async ()=>{
	console.log("Awaiting connection")
	for await (let {socket} of sockets.listener('connection')) {
		console.log('Player connected!');
		const id = socket.id;
		( async () => {
			for await (let data of socket.receiver('nickname')) {
				console.log("Get nickname", data.nick,"from", socket.id)
				game.addThing({id, type: 'players', showName: data.nick});
			}
		})();
		( async () => {
			for await (let data of socket.receiver('HoldMyBear')) {
				hold[socket.id] = data
			}
		})();
		( async () => {
			for await (let state of socket.procedure('setup')) {
				if (state.data && state.data.bad) {
					console.log('Error on client')
					let CustomError = new Error('Failed to setup')
					CustomError = 'SetupError'
					state.error(CustomError)
					continue
				}
				else {
					console.log("Get OldId", state.data.oldId,"from", socket.id)
					console.log('Initializing player state')
					game.swapId(state.data.oldId, socket.id)
					state.end({state : game.getState(), consts : game.consts})
				}
			}
		})();
		( async () => {
			const channel = socket.receiver('movement')
			for await (let data of channel) {
				game.moveThing(data)
				sockets.exchange.transmitPublish('game', game.getState());
			}
		})();
	}
})();
(async() => {
	for await (let {socket} of sockets.listener('disconnection')) {
		console.log('Player disconnected!');
		const id = socket.id
		if (hold[id])
			hold[id] = false
		else
			game.removeThing({id, type : "players"});
	}
})();

server.listen(3000,	() => {
		console.log("> Server listening on port: 3000")
	})