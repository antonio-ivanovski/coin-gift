import { Hono } from "hono";
import { cors } from "hono/cors";
import type {
	ApiResponse,
	CreateGiftRequest,
	CreateGiftResponse,
	GiftStatusResponse,
	RedeemGiftRequest,
	RedeemGiftResponse,
} from "shared/dist";

export const app = new Hono()

	.use(cors())

	.get("/", (c) => {
		return c.text("🎁 Bitcoin Gift API - Ready to serve!");
	})

	.get("/health", async (c) => {
		const data: ApiResponse = {
			message: "Bitcoin Gift API is healthy",
			success: true,
		};

		return c.json(data, { status: 200 });
	})

	// Create a new Bitcoin gift
	.post("/gifts", async (c) => {
		try {
			const body = (await c.req.json()) as CreateGiftRequest;

			// TODO: Implement gift creation logic
			// 1. Generate high-entropy secret and hash it
			// 2. Generate unique Bitcoin address and encrypt private key
			// 3. Store gift in database with encrypted private key
			// 4. Start monitoring the address for payments
			// 5. Return payment address and gift details

			const response: CreateGiftResponse = {
				success: true,
				gift_id: "temp_id",
				secret: "temp_secret_code",
				qr_code: "data:image/png;base64,temp_qr",
				share_url: `${c.req.url}/claim/temp_secret_code`,
				payment_address: "bc1qtemp_unique_gift_address",
				amount_sats: body.amount_sats,
				expires_at: new Date(
					Date.now() + (body.expires_in_days || 30) * 24 * 60 * 60 * 1000,
				),
			};

			return c.json(response, { status: 201 });
		} catch (error) {
			return c.json(
				{ success: false, message: "Failed to create gift" },
				{ status: 400 },
			);
		}
	})

	// Redeem a Bitcoin gift (adds to batch queue)
	.post("/gifts/redeem", async (c) => {
		try {
			const body = (await c.req.json()) as RedeemGiftRequest;

			// TODO: Implement redemption logic
			// 1. Verify secret and check expiration
			// 2. Validate Bitcoin address
			// 3. Add to batch redemption queue
			// 4. Return queue position and estimated time

			const response: RedeemGiftResponse = {
				success: true,
				message: "Gift queued for batch processing",
				estimated_processing_time: "Processing in next batch (≤30 minutes)",
				amount_sats: 100000, // temp value
				batch_position: 3,
			};

			return c.json(response, { status: 200 });
		} catch (error) {
			return c.json(
				{ success: false, message: "Failed to redeem gift" },
				{ status: 400 },
			);
		}
	})

	// Check gift status
	.get("/gifts/:secret/status", async (c) => {
		try {
			const secret = c.req.param("secret");

			// TODO: Implement status check
			// 1. Hash secret and lookup in database
			// 2. Return current status and processing info

			const response: GiftStatusResponse = {
				success: true,
				gift: {
					id: "temp_id",
					secret_hash: "temp_hash",
					amount_sats: 100000,
					gift_address: "bc1qtemp_unique_gift_address",
					private_key_encrypted: "encrypted_private_key",
					status: "active",
					created_at: new Date(),
					expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				},
			};

			return c.json(response, { status: 200 });
		} catch (error) {
			return c.json(
				{ success: false, message: "Gift not found" },
				{ status: 404 },
			);
		}
	})

	// Get current Bitcoin network fees and batch info
	.get("/bitcoin/fees", async (c) => {
		try {
			// TODO: Implement fee estimation
			// 1. Query mempool.space API
			// 2. Return current fee rates and batch timing

			return c.json(
				{
					success: true,
					current_fee_rate: 10, // sats/vB
					next_batch_in: "15 minutes",
					batch_size: 7,
					estimated_fee_per_gift: 2500, // sats
				},
				{ status: 200 },
			);
		} catch (error) {
			return c.json(
				{ success: false, message: "Failed to fetch fees" },
				{ status: 500 },
			);
		}
	})

	// Admin endpoint to trigger batch processing (for testing)
	.post("/admin/process-batch", async (c) => {
		try {
			// TODO: Manual batch processing trigger
			// This would normally be handled by a cron job

			return c.json(
				{
					success: true,
					message: "Batch processing triggered",
					transactions_processed: 5,
				},
				{ status: 200 },
			);
		} catch (error) {
			return c.json(
				{ success: false, message: "Batch processing failed" },
				{ status: 500 },
			);
		}
	});

export default app;
