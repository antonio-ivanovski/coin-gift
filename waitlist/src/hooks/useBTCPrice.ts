import { useQuery } from "@tanstack/react-query";

export function useBTCPrice() {
	return useQuery({
		queryKey: ["btc-price"],
		queryFn: async () => {
			const response = await fetch(
				"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
			);
			if (response.ok) {
				const data = await response.json();
				return {
					usd: parseFloat(data.bitcoin?.usd),
					source: "coingecko",
				};
			}
			throw new Error("Failed to fetch BTC price");
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
		retry: (failureCount) => failureCount < 2, // Only retry once
	});
}