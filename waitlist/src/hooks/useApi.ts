import { useMutation } from "@tanstack/react-query";
import type {
	StandaloneDonationRequest,
	StandaloneDonationResponse,
	WaitlistSignupRequest,
	WaitlistSignupResponse,
} from "shared/dist";

// Waitlist signup mutation
export function useWaitlistSignup() {
	return useMutation({
		mutationFn: async (
			data: WaitlistSignupRequest,
		): Promise<WaitlistSignupResponse> => {
			const response = await fetch("/api/waitlist/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Failed to join waitlist" }));
				throw new Error(errorData.message || "Failed to join waitlist");
			}

			return await response.json();
		},
		onSuccess: (data) => {
			console.log("Waitlist signup successful:", data);
		},
		onError: (error) => {
			console.error("Waitlist signup failed:", error);
		},
	});
}

// Standalone donation mutation (for donations without signup)
export function useStandaloneDonation() {
	return useMutation({
		mutationFn: async (
			data: StandaloneDonationRequest,
		): Promise<StandaloneDonationResponse> => {
			const response = await fetch("/api/waitlist/donate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Failed to create donation" }));
				throw new Error(errorData.message || "Failed to create donation");
			}

			return await response.json();
		},
		onSuccess: (data) => {
			console.log("Standalone donation created:", data);
		},
		onError: (error) => {
			console.error("Standalone donation failed:", error);
		},
	});
}
