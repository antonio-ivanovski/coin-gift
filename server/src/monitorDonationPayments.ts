import type { Nip47Notification, NWCClient } from "@getalby/sdk/nwc";
import type { Context } from "hono";
import { markCompletedDonation } from "./waitlist";

type PaymentStatusCallback = (
	status: "settled" | "failed",
	notification: Nip47Notification,
) => void;

// Track active listeners per payment hash
const paymentListeners = new Map<string, Set<PaymentStatusCallback>>();
let isMonitoringInitialized = false;
let unsubscribeFromNWC: (() => void) | null = null;

/**
 * Initialize the global NWC payment notification listener.
 * This should be called once when the server starts.
 */
export async function initializeDonationPaymentMonitoring(
	nwcClient: NWCClient,
) {
	if (isMonitoringInitialized) {
		return;
	}

	isMonitoringInitialized = true;

	// Subscribe to NWC notifications and store the unsubscribe function
	const notificationHandler = (notification: Nip47Notification) => {
		console.log("NWC Notification received:", notification);

		// Get the payment hash from the notification
		const paymentHash = notification.notification.payment_hash;
		if (!paymentHash) {
			console.warn("Notification missing payment_hash:", notification);
			return;
		}

		// Determine the status based on notification type
		// payment_received: invoice was paid
		// hold_invoice_accepted: hold invoice was accepted (for gift invoices)
		let status: "settled" | "failed" | null = null;
		if (notification.notification_type === "payment_received") {
			status = "settled";
		}
		// Note: For now we only handle successful payments
		// Failed/expired payments would need additional handling

		if (!status) {
			console.log(
				"Ignoring notification type:",
				notification.notification_type,
			);
			return;
		}

		// Update donation status in database
		markCompletedDonation(
			paymentHash,
			status === "settled" ? "paid" : "expired",
		)
			.then(() => {
				console.log(`Updated donation status for ${paymentHash} to ${status}`);
			})
			.catch((error) => {
				console.error(
					`Failed to update donation status for ${paymentHash}:`,
					error,
				);
			});

		// Notify all listeners for this payment hash
		const listeners = paymentListeners.get(paymentHash) ?? new Set();
		console.log(
			`Notifying ${listeners.size} listener(s) for payment ${paymentHash}`,
		);
		for (const callback of listeners) {
			try {
				callback(status, notification);
			} catch (error) {
				console.error("Error in payment listener callback:", error);
			}
		}
	};

	// Subscribe to NWC and store the unsubscribe function
	unsubscribeFromNWC =
		await nwcClient.subscribeNotifications(notificationHandler);

	console.log("Payment monitoring initialized");
}

/**
 * Shutdown the payment monitoring system and unsubscribe from NWC notifications.
 * This should be called when the server is shutting down.
 */
export function shutdownDonationPaymentMonitoring() {
	if (!isMonitoringInitialized) {
		return;
	}

	console.log("Shutting down payment monitoring...");

	// Unsubscribe from NWC notifications
	if (unsubscribeFromNWC) {
		unsubscribeFromNWC();
		unsubscribeFromNWC = null;
	}

	// Clear all payment listeners
	paymentListeners.clear();

	isMonitoringInitialized = false;

	console.log("Payment monitoring shutdown complete");
}

/**
 * Subscribe to payment status updates for a specific payment hash.
 * Returns an unsubscribe function.
 */
export function subscribeToPayment(
	paymentHash: string,
	callback: PaymentStatusCallback,
): () => void {
	let listeners = paymentListeners.get(paymentHash);
	if (!listeners) {
		listeners = new Set();
		paymentListeners.set(paymentHash, listeners);
	}

	listeners.add(callback);
	console.log(
		`Subscribed to payment ${paymentHash}. Total listeners: ${listeners.size}`,
	);

	// Return unsubscribe function
	return () => {
		const listeners = paymentListeners.get(paymentHash);
		if (listeners) {
			listeners.delete(callback);
			console.log(
				`Unsubscribed from payment ${paymentHash}. Remaining listeners: ${listeners.size}`,
			);

			// Clean up empty sets
			if (listeners.size === 0) {
				paymentListeners.delete(paymentHash);
			}
		}
	};
}
