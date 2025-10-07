import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const queryClient = new QueryClient();

import { hcWithType } from "server/dist/client";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api";
const apiClient = hcWithType(SERVER_URL);

// Create a new router instance
const router = createRouter({ routeTree, context: { apiClient } });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error(
		"Root element not found. Check if it's in your index.html or if the id is correct.",
	);
}

// Render the app
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</StrictMode>,
	);
}