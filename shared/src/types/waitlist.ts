import z from "zod";

// Waitlist API Types
export type WaitlistSignupRequest = {
	email: string;
	donationAmountSats?: number;
};

export type WaitlistSignupResponse = {
	success: boolean;
	signupId: string;
	donationInvoice?: string;
	donationPaymentHash?: string;
};

export type StandaloneDonationRequest = {
	donationAmountSats: number;
};

export type StandaloneDonationResponse = {
	id: string;
	amountSats: number;
	donationInvoice: string;
	donationPaymentHash: string;
	createdAt: Date;
};

export const MIN_DONATION_AMOUNT = 100;
export const DEFAULT_DONATION_AMOUNT = 1000;
export const MAX_DONATION_AMOUNT = 100000;

// Waitlist validation schemas
export const waitlistSignupRequestSchema = z.object({
	email: z.email(),
	donationAmountSats: z.number().min(100).max(100000).optional(),
});

export const standaloneDonationRequestSchema = z.object({
	donationAmountSats: z
		.number()
		.min(MIN_DONATION_AMOUNT)
		.max(MAX_DONATION_AMOUNT),
});

// Payment Status SSE Event Types
export type PaymentStatusEvent =
	| "connected"
	| "settled"
	| "failed"
	| `heartbeat-${number}`;
