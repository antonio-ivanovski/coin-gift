import { useMutation } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import type { Client } from "server/dist/client";
import beaver from "../assets/beaver.svg";

type ResponseType = Awaited<ReturnType<Client["hello"]["$get"]>>;

const routeApi = getRouteApi("/");

export function HomePage() {
	const { apiClient } = routeApi.useRouteContext();
	const mutation = useMutation({
		mutationFn: async () => {
			const res = await apiClient.hello.$get();
			if (!res.ok) {
				console.log("Error fetching data");
				return;
			}
			return (await res.json()) as Awaited<ReturnType<ResponseType["json"]>>;
		},
	});

	return (
		<div className="max-w-xl mx-auto flex flex-col gap-6 items-center justify-center min-h-screen">
			<a
				href="https://github.com/stevedylandev/bhvr"
				target="_blank"
				rel="noopener"
			>
				<img
					src={beaver}
					className="w-16 h-16 cursor-pointer"
					alt="beaver logo"
				/>
			</a>
			<h1 className="text-5xl font-black">bhvr</h1>
			<h2 className="text-2xl font-bold">Bun + Hono + Vite + React</h2>
			<p>A typesafe fullstack monorepo</p>
			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={() => mutation.mutate()}
					className="bg-black text-white px-2.5 py-1.5 rounded-md"
				>
					Call API
				</button>
				<a
					target="_blank"
					href="https://bhvr.dev"
					className="border-1 border-black text-black px-2.5 py-1.5 rounded-md"
					rel="noopener"
				>
					Docs
				</a>
			</div>
			{mutation.isSuccess && (
				<pre className="bg-gray-100 p-4 rounded-md">
					<code>
						Message: {mutation.data?.message} <br />
						Success: {mutation.data?.success.toString()}
					</code>
				</pre>
			)}
		</div>
	);
}
