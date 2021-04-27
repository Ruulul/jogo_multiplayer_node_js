export default function createKeyboardListener(playerId){
		const state = {
			observers: []
		}
	
		function subscribe(observerFunction) {
			state.observers.push(observerFunction)
		}
		
		function unsubscribe(observerFunction) {
			state.observers.pull(observerFunction)
		}
		
		function notifyAll(command) {
			for (const observerFunction of state.observers) {
				observerFunction(command)
			}
		}
		
		document.addEventListener('keydown', handleKeydown)
		function handleKeydown(event) {
			const KeyPressed = event.key

			const command = {
				id: playerId,
				type : 'players',
				KeyPressed
			}
			notifyAll(command)
		}
		
		return {
			subscribe,
			unsubscribe
		}
	}		