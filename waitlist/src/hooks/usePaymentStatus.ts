import { useQuery } from "@tanstack/react-query";
import { PaymentStatusEvent } from "shared";

type PaymentStatusResult = Extract<PaymentStatusEvent, "settled" | "failed">;

/**
 * Creates a promise that resolves when the payment is settled or failed
 * by listening to SSE events from the server.
 */
function waitForPaymentStatus(
	paymentHash: string,
): Promise<PaymentStatusResult> {
	return new Promise((resolve, reject) => {
		const eventSource = new EventSource(
			`${import.meta.env.VITE_API_URL}/payments/${paymentHash}/status`,
		);

		console.log(`Setting up payment status SSE for: ${paymentHash}`);

		eventSource.addEventListener("connected", () => {
			console.log(`Payment status SSE connected for: ${paymentHash}`);
		});

		eventSource.addEventListener("payment-status", (event) => {
			console.log(`Payment status SSE event: ${paymentHash} - ${event.data}`);

			console.log(`Payment completed ${paymentHash} - ${event.data}`);
			eventSource.close();
			resolve(event.data);
		});

		eventSource.addEventListener("heartbeat", (event) => {
			console.log("Payment status SSE heartbeat:", event.data);
		});

		eventSource.onerror = (event) => {
			console.error(`Payment status SSE error: ${paymentHash}`, event);
			eventSource.close();
			reject(new Error("SSE connection error"));
		};

		// Cleanup timeout to prevent hanging promises
		const timeout = setTimeout(
			() => {
				console.warn(`Payment status SSE timeout for: ${paymentHash}`);
				eventSource.close();
				reject(new Error("Payment status timeout"));
			},
			20 * 60 * 1000,
		); // 20 minute timeout

		// Clear timeout if resolved/rejected
		const originalResolve = resolve;
		const originalReject = reject;
		resolve = (value) => {
			clearTimeout(timeout);
			originalResolve(value);
		};
		reject = (reason) => {
			clearTimeout(timeout);
			originalReject(reason);
		};
	});
}

/**
 * Hook to monitor payment status via SSE using React Query.
 * Returns a query object that resolves when the payment is settled or failed.
 *
 * @param paymentHash - The payment hash to monitor
 * @param enabled - Whether to start monitoring (default: true)
 *
 * @example
 * ```tsx
 * function PaymentMonitor({ paymentHash }: { paymentHash: string }) {
 *   const { data, isLoading, isError, error } = usePaymentStatus(paymentHash);
 *
 *   if (isLoading) return <p>Waiting for payment...</p>;
 *   if (isError) return <p>Error: {error.message}</p>;
 *   if (data?.status === 'settled') return <p>Payment successful! ✅</p>;
 *   if (data?.status === 'failed') return <p>Payment failed ❌</p>;
 *
 *   return null;
 * }
 * ```
 */
export function usePaymentStatus(
	paymentHash: string | undefined,
	enabled = true,
) {
	return useQuery({
		queryKey: ["payment-status", paymentHash],
		queryFn: () => {
			if (!paymentHash) {
				throw new Error("Payment hash is required");
			}
			return waitForPaymentStatus(paymentHash);
		},
		enabled: enabled && !!paymentHash,
		// Don't retry on error - payment status is a one-time operation
		retry: false,
		// Keep the result in cache for 5 minutes after success
		staleTime: 5 * 60 * 1000,
		// Don't refetch on window focus or reconnect
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
}
