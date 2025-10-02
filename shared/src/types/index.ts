import z from "zod";

export type ApiResponse = {
	message: string;
	success: true;
};

export type BitcoinGift = {
	id: string;
	secret_hash: string;
	amount_sats: number;
	amount_usd?: number;
	gift_address: string; // Unique Bitcoin address for this gift
	private_key_encrypted: string; // AES encrypted private key
	sender_address?: string; // Sender's refund address
	sender_email?: string;
	recipient_address?: string;
	payment_txid?: string; // Transaction ID of incoming payment
	status:
		| "pending"
		| "paid"
		| "active"
		| "queued"
		| "redeemed"
		| "expired"
		| "cancelled";
	created_at: Date;
	expires_at: Date;
	paid_at?: Date;
	redeemed_at?: Date;
	batch_id?: string;
};

export type RedemptionRequest = {
	id: string;
	gift_id: string;
	recipient_address: string;
	amount_sats: number;
	queued_at: Date;
	processed_at?: Date;
	batch_id?: string;
	status: "queued" | "processing" | "completed" | "failed";
};

export const initGiftRequestSchema = z.object({
	count: z.number().min(1).max(20),
	satsPerGift: z.number().min(500).max(100_000),
	title: z.string().min(1).max(100),
	message: z.string().max(500),
	emoji: z.string().min(1).max(4),
	expiryMinutes: z
		.number()
		.min(10)
		.max(60 * 24 * 30),
	notification_email: z.email().optional(),
});

export type InitGiftRequest = z.infer<typeof initGiftRequestSchema>;

export const initGiftItemSchema = z.object({
	id: z.string(),
	invoice: z.string(),
	redeemSecret: z.string().min(64).max(64),
});
export const initGiftResponseSchema = z.object({
	id: z.string(),
	gifts: z.array(
		z.object({
			id: z.string(),
			invoice: z.string(),
			redeem_secret: z.string().min(64).max(64),
		}),
	),
});
export type InitGiftItem = z.infer<typeof initGiftItemSchema>;
export type InitGiftResponse = z.infer<typeof initGiftResponseSchema>;

export type RedeemGiftRequest = {
	secret: string;
	recipient_address: string;
};

export type RedeemGiftResponse = {
	success: true;
	message: string;
	estimated_processing_time: string;
	amount_sats: number;
	batch_position?: number;
};

export type GiftStatusResponse = {
	success: true;
	gift: BitcoinGift;
	estimated_processing_time?: string;
};

// Lightning Network types (for future use)
export type LightningGift = {
	id: string;
	secret_hash: string;
	amount_sats: number;
	payment_hash: string;
	payment_request: string;
	status: "pending" | "paid" | "redeemed" | "expired";
	created_at: Date;
	expires_at: Date;
};

export type PaymentMethod = "mainnet" | "lightning";

export type GiftOptions = {
	method: PaymentMethod;
	instant?: boolean; // mainnet: pay higher fee for immediate processing
};

// Address monitoring types
export type AddressMonitor = {
	address: string;
	gift_id: string;
	expected_amount_sats: number;
	created_at: Date;
	last_checked_at?: Date;
	status: "monitoring" | "paid" | "expired" | "cancelled";
};

export type BitcoinTransaction = {
	txid: string;
	address: string;
	amount_sats: number;
	confirmations: number;
	block_height?: number;
	timestamp: Date;
};

// Address generation types
export type GeneratedAddress = {
	address: string;
	private_key: string; // Should be encrypted before storage
	public_key: string;
	derivation_path?: string;
};
