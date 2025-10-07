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
	donationPaymentHash?: string;
	createdAt: Date;
};

// Waitlist validation schemas
export const waitlistSignupRequestSchema = z.object({
	email: z.email(),
	donationAmountSats: z.number().min(1000).max(100000).optional(),
});

export const standaloneDonationRequestSchema = z.object({
	donationAmountSats: z.number().min(1000).max(100000),
});
