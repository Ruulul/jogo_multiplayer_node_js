export default function createGame(screen) {
				function subscribe(observerFunction) {
					observers.push(observerFunction)
				}
				
				function unsubscribe(observerFunction) {
					observers.pull(observerFunction)
				}
				
				function notifyAll(command) {
					for (const observerFunction of observers) {
						observerFunction(command)
					}
				}
				
				const consts = {
					scale: 32,
					background_color: '#ffdace'
				}
				var observers = []
				const state = {
					score: {},
					screen: {
						width : 320,
						height : 320
					},
					players: {
						count : 0,
						colorAll : 'black',
						colorMe : 'purple',
						velocity : 0.1,
						collisionRatio : 0.2,
						halfSize : 0.2,
						things:{}
					},
					fruits: {
						count : 0,
						colorAll : 'green',
						velocity : .0,
						collisionRatio : 0.1,
						halfSize : 0.1,
						things:{}
					}
				}
				function addThing(command) {
					const type = command.type
					if (type == 'fruits' && state.fruits.count >= state.players.count * 30)
						return "Fruit limit reached"
					const id = 'id' in command ? command.id : Math.random() * 10000;
					const x = 'positionX' in command ? command.positionX : state[type].halfSize + Math.random() * ((state.screen.width)/consts.scale - state[type].halfSize)
					const y = 'positionY' in command ? command.positionY : state[type].halfSize + Math.random() * ((state.screen.height)/consts.scale - state[type].halfSize)
					const name = 'showName' in command ? command.showName : type
					
					state[type].things[id] = {
						positionX : x,
						positionY : y,
						showName : name
					}
					if (type == 'players')
						state.score[name] = 0
					state[type].count++,  type
					detectCollision({id,type})
					return "New "+type
				}
				function removeThing(command) {
					const id = command.id
					const type = command.type
					delete state[type].things[id]
					state[type].count--
					if (type == 'players')
						delete state.score.showName
				}
				function moveThing(command) {
					const KeyPressed = command.KeyPressed
					const type = command.type
					const thing = state[type].things[command.id]
					const size = state[type].halfSize
					const velocity = state[type].velocity
					const events = {
					'ArrowUp': ()=>{
						if (thing.positionY - velocity >= size)
							thing.positionY -= velocity
						else thing.positionY = size
					},
					'ArrowDown': ()=>{
						if (thing.positionY + velocity <= state.screen.height/consts.scale - size)
							thing.positionY += velocity
						else thing.positionY = state.screen.height/consts.scale - size
					},
					'ArrowLeft': ()=>{
						if (thing.positionX - velocity >= size)
							thing.positionX -= velocity
						else thing.positionX = size
					},
					'ArrowRight': ()=>{
						if (thing.positionX + velocity <= state.screen.width/consts.scale - size)
							thing.positionX += velocity
						else thing.positionX = state.screen.width/consts.scale - size
					},
					}
					if (thing)
						if (events[KeyPressed]){
							events[KeyPressed]()
					
						detectCollision(command)
						notifyAll(getState())
						}
				}
				
				function getRect(thing, type) {
					const center = {
						x: thing.positionX,
						y: thing.positionY
					}
					const cr = state[type].collisionRatio
					const x = center.x - cr
					const y = center.y - cr
					const x2 = center.x + cr
					const y2 = center.y + cr
					
					const rect = {
						x, y, x2, y2
					}
					
					return rect
				}
				
				function detectCollision(command) {
					const type = command.type
					const thing = state[type].things[command.id]
					const do_collision = {
						'players' : {
							'fruits' : (c_command) => {removeThing(c_command),state.score[state.players.things[c_command.this_id].showName]++},
							'players' : (c_command) => {}
						},
						'fruits' : {
							'players' : (c_command) => {removeThing({id: c_command.this_id, type : 'fruits'}),state.score[state.players.things[c_command.id].showName]++},
							'fruits' : (c_command) => {}
							
						}
					}
					
					const this_rect = getRect(thing, type)
					for (const other_type in state) {
						for (const id in state[other_type].things){
							const other_thing = state[other_type].things[id]
							if (thing != other_thing) {
								const other_rect = getRect(other_thing, other_type)
								if ( 
										(this_rect.x < other_rect.x2) &&
										(this_rect.y < other_rect.y2) &&
										(other_rect.x < this_rect.x2) &&
										(other_rect.y < this_rect.y2)
									) {
									const collision_command = {
										this_id: command.id,
										id,
										type : other_type
									}
									do_collision[type][other_type](collision_command)
								}
							}
						}
					}
				}
				
				function getState() {
					const state_for_client = JSON.parse(JSON.stringify(state))
					for (const type in state_for_client) {
						delete state_for_client[type].velocity
						delete state_for_client[type].collisionRatio
					}
					return state_for_client
				}
				
				function swapId(oldId, newId) {
					const old_player = state.players.things[oldId]
					const new_player = JSON.parse(JSON.stringify(old_player))
					
					delete state.players.things[oldId]
					
					state.players.things[newId] = new_player
				}
				
				return {
					moveThing,
					addThing,
					removeThing,
					swapId,
					getState,
					consts,
					subscribe,
					unsubscribe
				}
			}
			