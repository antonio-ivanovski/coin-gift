import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	ApiResponse,
	CreateGiftRequest,
	CreateGiftResponse,
	GiftStatusResponse,
} from "shared/dist";

// Get the server URL from environment
const getServerUrl = () =>
	import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// BTC Price Query
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

// Gift Creation Mutation
export function useCreateGift() {
	return useMutation({
		mutationFn: async (
			giftData: CreateGiftRequest,
		): Promise<CreateGiftResponse> => {
			const response = await fetch(`${getServerUrl()}/gifts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(giftData),
			});

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Failed to create gift" }));
				throw new Error(errorData.message || "Failed to create gift");
			}

			return await response.json();
		},
		onSuccess: (data) => {
			console.log("Gift created successfully:", data);
		},
		onError: (error) => {
			console.error("Gift creation failed:", error);
		},
	});
}

// Gift Status Query
export function useGiftStatus(secret: string | null) {
	return useQuery({
		queryKey: ["gift-status", secret],
		queryFn: async (): Promise<GiftStatusResponse> => {
			if (!secret) {
				throw new Error("No secret provided");
			}

			const response = await fetch(`${getServerUrl()}/gifts/${secret}/status`);

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Failed to fetch gift status" }));
				throw new Error(errorData.message || "Failed to fetch gift status");
			}

			return await response.json();
		},
		enabled: !!secret, // Only run query if secret is provided
		refetchInterval: (data) => {
			// If gift is still pending payment, refetch every 10 seconds
			if (data?.state.data?.gift?.status === "pending") {
				return 10 * 1000;
			}
			// If gift is paid but not redeemed, refetch every 30 seconds
			if (data?.state.data?.gift?.status === "active") {
				return 30 * 1000;
			}
			// If completed or expired, don't refetch
			return false;
		},
		retry: (failureCount) => failureCount < 3,
	});
}

// Health Check Query
export function useHealthCheck() {
	return useQuery({
		queryKey: ["health"],
		queryFn: async (): Promise<ApiResponse> => {
			const response = await fetch(`${getServerUrl()}/health`);

			if (!response.ok) {
				throw new Error("Health check failed");
			}

			return await response.json();
		},
		staleTime: 30 * 1000, // 30 seconds
		retry: false, // Don't retry health checks
	});
}

// Custom hook for gift payment monitoring
export function useGiftPaymentMonitoring(giftId: string | null) {
	const queryClient = useQueryClient();

	const { data: giftStatus, isLoading, error, refetch } = useGiftStatus(giftId);

	const startMonitoring = () => {
		if (giftId) {
			// Start polling for payment confirmation
			queryClient.invalidateQueries({ queryKey: ["gift-status", giftId] });
		}
	};

	const stopMonitoring = () => {
		if (giftId) {
			// Stop polling
			queryClient.cancelQueries({ queryKey: ["gift-status", giftId] });
		}
	};

	const isAwaitingPayment = giftStatus?.gift?.status === "pending";
	const isPaymentConfirmed = giftStatus?.gift?.status === "active";
	const isExpired = giftStatus?.gift?.status === "expired";

	return {
		giftStatus,
		isLoading,
		error,
		refetch,
		startMonitoring,
		stopMonitoring,
		isAwaitingPayment,
		isPaymentConfirmed,
		isExpired,
	};
}
