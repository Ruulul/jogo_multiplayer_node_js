export default function renderScreen(context, s, consts, state,render, playerId) {
				context.fillStyle = consts.background_color;
				context.fillRect(0,0, s.screen.width, s.screen.height);
				
				for (const type in state) {
					for (const id in state[type].things) {
						const thing = state[type].things[id]
						if (id != playerId)
							context.fillStyle = state[type].colorAll
						else
							context.fillStyle = state[type].colorMe
						context.fillRect(
							(thing.positionX-state[type].halfSize)*consts.scale,
							(thing.positionY-state[type].halfSize)*consts.scale,
							consts.scale*state[type].halfSize*2,
							consts.scale*state[type].halfSize*2)
					}
				}
				if (render)
				render(
					()=>{
						renderScreen(context, s, consts, state, playerId)
					}
				)
				else
				console.log('Tem algo muito errado aqui')
			}