export default function createNetwork(client_state){
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
				
				function hearServer (state_for_client) {
					client_state = state_for_client
				}
				
				function hearClient (command) {
					notifyAll('', command)
				}
				
				return {
					subscribe,
					unsubscribe,
					hearServer,
					hearClient
				}
			}