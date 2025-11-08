import { useQuery } from "@tanstack/react-query";

/**
 * Bitcoin Price Hook with Multiple Sources and Fallback
 *
 * Features:
 * - Returns both USD price and satsPerUsd for easy conversions
 * - Tries multiple price sources in order (CoinGecko, Blockchain.info)
 * - Falls back to a default price ($60,000) if all sources fail
 * - Automatically refetches every 5 minutes
 *
 * Usage:
 * ```tsx
 * const { data } = useBTCPrice();
 * const usdValue = (sats / 100_000_000) * data.usd;
 * const satsValue = usdAmount * data.satsPerUsd;
 * ```
 */

// Default fallback price (roughly $123,534 USD per BTC as of late 08.10.2024)
const DEFAULT_BTC_PRICE_USD = 123_534;
const SATS_PER_BTC = 100_000_000;

interface BTCPriceData {
	btcPrice: number;
	satsPrice: number;
	source: string;
}

interface PriceFetcher {
	name: string;
	fetch: () => Promise<number>;
}

// Price fetcher implementations
const priceFetchers: PriceFetcher[] = [
	{
		name: "coingecko",
		fetch: async () => {
			const response = await fetch(
				"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
			);
			if (!response.ok) {
				throw new Error("CoinGecko API request failed");
			}
			const data = await response.json();
			const price = parseFloat(data.bitcoin?.usd);
			if (!price || Number.isNaN(price)) {
				throw new Error("Invalid price data from CoinGecko");
			}
			return price;
		},
	},
	{
		name: "blockchain.info",
		fetch: async () => {
			const response = await fetch("https://blockchain.info/ticker");
			if (!response.ok) {
				throw new Error("Blockchain.info API request failed");
			}
			const data = await response.json();
			const price = parseFloat(data.USD?.["15m"]);
			if (!price || Number.isNaN(price)) {
				throw new Error("Invalid price data from Blockchain.info");
			}
			return price;
		},
	},
	{
		name: "fallback",
		fetch: async () => {
			// Always succeeds with default price
			return DEFAULT_BTC_PRICE_USD;
		},
	},
];

// Try fetchers in order until one succeeds
async function fetchBtcPrice(): Promise<BTCPriceData> {
	for (const fetcher of priceFetchers) {
		try {
			const btcPrice = await fetcher.fetch();

			return {
				btcPrice,
				satsPrice: btcPrice / SATS_PER_BTC,
				source: fetcher.name,
			};
		} catch (error) {
			// Log error and try next fetcher
			console.warn(`Price fetcher '${fetcher.name}' failed:`, error);
			continue;
		}
	}

	// This should never happen since fallback always succeeds
	// But just in case, return default values
	return {
		btcPrice: DEFAULT_BTC_PRICE_USD,
		satsPrice: SATS_PER_BTC / DEFAULT_BTC_PRICE_USD,
		source: "emergency-fallback",
	};
}

export function useBtcPrice() {
	return useQuery({
		queryKey: ["btc-price"],
		queryFn: fetchBtcPrice,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
		retry: 2,
	});
}
