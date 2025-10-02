import crypto from "node:crypto";
import type { Nip47Transaction, NWCClient } from "@getalby/sdk";

export type InitiateGiftsResultItem = {
	preimage: Buffer;
	holdInvoice: Nip47Transaction;
};

/**
 * Initiate gift invoices by using the hold invoice feature of LN.
 */
export async function initiateGiftInvoices(
	params: { count: number; satsPerGift: number },
	ctx: { nwcClient: NWCClient },
): Promise<InitiateGiftsResultItem[]> {
	const giftPreimages = new Array(params.count)
		.fill(null)
		.map(() => crypto.randomBytes(32));
	const hashedGiftPreimages = await Promise.all(
		giftPreimages.map(async (preimage) => {
			return crypto.hash("SHA-256", preimage, "hex");
		}),
	);

	return await Promise.all(
		hashedGiftPreimages.map(async (preimageHash, giftIndex) => {
			console.log("Creating gifts with preimage hashes:", preimageHash);
			const holdInvoice = await ctx.nwcClient.makeHoldInvoice({
				amount: params.satsPerGift * 1000,
				payment_hash: preimageHash,
			});
			return { preimage: giftPreimages[giftIndex]!, holdInvoice };
		}),
	);
}
