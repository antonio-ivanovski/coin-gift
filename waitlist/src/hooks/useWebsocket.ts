import { useEffect } from "react";

export function useWebsocket() {
	useEffect(() => {
		const ws = new WebSocket("ws://localhost:3000/ws");
		ws.onmessage = (event) => {
			console.log("WebSocket message received:", event.data);
		};
		return () => {
			ws.close();
		};
	}, []);
}
