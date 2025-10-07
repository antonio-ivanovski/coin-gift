import type { NWCClient } from "@getalby/sdk/nwc";
import { eq } from "drizzle-orm";
import type { WaitlistSignupRequest } from "shared/dist";
import { db } from "./db";
import { waitlistDonationsTable, waitlistSignupsTable } from "./db/schema";

export type WaitlistDonation = typeof waitlistDonationsTable.$inferSelect & {
	status: "pending" | "paid" | "expired" | "cancelled";
	invoice: string;
};

// Create waitlist signup
export async function createWaitlistSignup(data: WaitlistSignupRequest) {
	// Create new signup
	const signup = await db
		.insert(waitlistSignupsTable)
		.values({ email: data.email })
		.returning();

	if (!signup[0]) {
		throw new Error("Failed to create waitlist signup");
	}

	return signup[0];
}

// Create Lightning invoice for donation (can be standalone or linked to signup)
export async function createDonationInvoice(
	amountSats: number,
	nwcClient: NWCClient,
	signupId?: string,
): Promise<WaitlistDonation> {
	// Create Lightning invoice
	const invoice = await nwcClient.makeInvoice({
		amount: amountSats * 1000, // Convert sats to millisats
		description: `Coin Gift 🎁`,
	});

	// Store donation record
	const donation = await db
		.insert(waitlistDonationsTable)
		.values({
			signupId: signupId || null,
			amountSats,
			status: "pending",
			paymentHash: invoice.payment_hash,
		})
		.returning();

	if (!donation[0]) {
		throw new Error("Failed to create donation record");
	}

	return {
		...donation[0],
		status: donation[0].status as WaitlistDonation["status"],
		invoice: invoice.invoice,
	};
}

export async function markCompletedDonation(
	paymentHash: string,
	newStatus: Exclude<WaitlistDonation["status"], "pending">,
): Promise<void> {
	await db
		.update(waitlistDonationsTable)
		.set({ status: newStatus })
		.where(eq(waitlistDonationsTable.paymentHash, paymentHash));
}
