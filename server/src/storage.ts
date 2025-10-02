import crypto from "node:crypto";

export type StoredGifts = {
	id: string;
	title: string;
	message: string;
	emoji: string;
	satsPerGift: number;
	expiresAt: Date;
	notificationEmail?: string;
	gifts: StoredGift[];
};
export type GiftsToStore = Omit<StoredGifts, "id" | "gifts"> & {
	gifts: GiftToStore[];
};

export type StoredGift = {
	id: string;
	encryptedSecret: Buffer;
	status: "initial" | "paid" | "redeemed" | "expired";
};
export type GiftToStore = Omit<StoredGift, "id" | "status">;

const DUMMY_DB: { giftBatches: StoredGifts[] } = { giftBatches: [] };

export async function storeGifts(gifts: GiftsToStore): Promise<StoredGifts> {
	const storedGifts: StoredGifts = {
		...gifts,
		gifts: gifts.gifts.map((g) => ({
			...g,
			id: crypto.randomBytes(16).toString("base64url"),
			status: "initial",
		})),
		id: DUMMY_DB.giftBatches.length.toString(),
	};
	DUMMY_DB.giftBatches.push(storedGifts);
	return storedGifts;
}

export async function getGiftsBatch(giftsId: string) {
	const batch = DUMMY_DB.giftBatches.find((b) => b.id === giftsId);
	if (batch) return batch;
	return null;
}

export async function getGift(giftId: string) {
	for (const giftBatch of DUMMY_DB.giftBatches) {
		const gift = giftBatch.gifts.find((g) => g.id === giftId);
		if (gift) return gift;
	}
	return null;
}

export async function changeGiftStatus(
	giftId: string,
	status: StoredGift["status"],
) {
	for (const giftBatch of DUMMY_DB.giftBatches) {
		const gift = giftBatch.gifts.find((g) => g.id === giftId);
		if (gift) {
			gift.status = status;
			return gift;
		}
	}
	throw new Error(`Gift "${giftId}" not found`);
}
