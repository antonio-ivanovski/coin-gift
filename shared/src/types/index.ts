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

export type BatchTransaction = {
	id: string;
	transaction_id: string;
	total_amount_sats: number;
	fee_sats: number;
	output_count: number;
	status: "creating" | "broadcasting" | "confirmed" | "failed";
	created_at: Date;
	confirmed_at?: Date;
};

export type CreateGiftRequest = {
	amount_sats: number;
	sender_email?: string;
	message?: string;
	expires_in_days?: number; // default 30
};

export type CreateGiftResponse = {
	success: true;
	gift_id: string;
	secret: string;
	qr_code: string;
	share_url: string;
	payment_address: string; // Unique address for this gift
	amount_sats: number;
	expires_at: Date;
};

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
