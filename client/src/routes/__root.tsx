import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { Client } from "server/dist/client";

type RouterContext = {
	apiClient: Client;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: Component,
});

function Component() {
	return (
		<>
			<Outlet />
			<TanStackRouterDevtools />
		</>
	);
}
