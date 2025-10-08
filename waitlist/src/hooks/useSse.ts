import { useEffect } from "react";

export function useSse() {
	useEffect(() => {
		console.log("Setting up SSE connection");
		const eventSource = new EventSource("http://localhost:3000/sse");
		console.log("EventSource created:", eventSource);

		eventSource.onopen = (event) => {
			console.log("SSE connection opened:", event);
		};

		// Listen for connection confirmation
		eventSource.addEventListener("connection", (event) => {
			console.log("SSE connection confirmed:", event.data);
		});

		// Listen for the specific "time-update" event that the server sends
		eventSource.addEventListener("time-update", (event) => {
			console.log("SSE time-update received:", event.data);
		});

		eventSource.onerror = (event) => {
			console.log("SSE error:", event);
			console.log("ReadyState:", eventSource.readyState);
		};

		// Send periodic heartbeat to help server detect disconnection
		const heartbeat = setInterval(() => {
			if (eventSource.readyState === EventSource.OPEN) {
				console.log("SSE heartbeat - connection still alive");
			}
		}, 10000);

		return () => {
			console.log("Closing SSE connection");
			clearInterval(heartbeat);
			eventSource.close();
		};
	}, []);
}
