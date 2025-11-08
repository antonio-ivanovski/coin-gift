import type { NWCClient } from "@getalby/sdk/nwc";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { streamSSE } from "hono/streaming";
import { validator } from "hono/validator";
import {
	type InitGiftResponse,
	initGiftRequestSchema,
	type PaymentStatusEvent,
	type StandaloneDonationRequest,
	type StandaloneDonationResponse,
	standaloneDonationRequestSchema,
	type WaitlistSignupRequest,
	type WaitlistSignupResponse,
	waitlistSignupRequestSchema,
} from "shared/dist";
import { applyDbMigrations } from "./db";
import { encryptPreimage } from "./encryption";
import { initiateGiftInvoices } from "./initiateGifts";
import {
	initializeDonationPaymentMonitoring,
	shutdownDonationPaymentMonitoring,
	subscribeToPayment,
} from "./monitorDonationPayments";
import { nwcClient } from "./nwc";
import { getGiftsBatch, storeGifts } from "./storage";
import { createDonationInvoice, createWaitlistSignup } from "./waitlist";

applyDbMigrations();

type Env = {
	Bindings: {
		DATABASE_URL: string;
		NWC_URL: string;
	};
	Variables: {
		nwcClient: NWCClient;
	};
};

if (!process.env.APP_URL) {
	throw new Error("APP_URL environment variable is not set");
}
export const app = new Hono<Env>().use(cors({ origin: process.env.APP_URL! }));

const diMiddleware = createMiddleware<Env>(async (c, next) => {
	c.set("nwcClient", nwcClient as NWCClient);
	await next();
});
app.use(diMiddleware);

app.post(
	"/init-gifts",
	validator("json", (v) => initGiftRequestSchema.parse(v)),
	async (c) => {
		const body = c.req.valid("json");
		const gifts = await initiateGiftInvoices(
			{ count: body.count, satsPerGift: body.satsPerGift },
			{ nwcClient: c.get("nwcClient") },
		);

		const encryptedGifts = gifts.map((g) => {
			return encryptPreimage(g.preimage);
		});
		const storedGifts = await storeGifts({
			title: body.title,
			message: body.message,
			emoji: body.emoji,
			satsPerGift: body.satsPerGift,
			expiresAt: new Date(Date.now() + body.expiryMinutes * 60 * 1000),
			notificationEmail: body.notification_email,
			gifts: encryptedGifts.map((eg) => ({ encryptedSecret: eg.encrypted })),
		});

		return c.json({
			id: storedGifts.id,
			gifts: gifts.map((gift, index) => ({
				id: storedGifts.gifts[index]!.id,
				invoice: gift.holdInvoice.invoice,
				redeem_secret: encryptedGifts[index]!.key.toString("base64url"),
			})),
		} satisfies InitGiftResponse);
	},
);

// Waitlist API endpoints

// Waitlist signup endpoint
app.post(
	"/waitlist/signup",
	validator("json", (v) => waitlistSignupRequestSchema.parse(v)),
	async (c) => {
		const body = c.req.valid("json") as WaitlistSignupRequest;

		// Create waitlist signup
		const signup = await createWaitlistSignup(body);

		// Create donation invoice if requested
		const donation = body.donationAmountSats
			? await createDonationInvoice(
					body.donationAmountSats,
					c.get("nwcClient"),
					signup.id,
				)
			: undefined;

		const response: WaitlistSignupResponse = {
			success: true,
			signupId: signup.id,
			donationInvoice: donation?.invoice,
			donationPaymentHash: donation?.paymentHash,
		};

		return c.json(response);
	},
);

// Standalone donation endpoint
app.post(
	"/waitlist/donate",
	validator("json", (v) => standaloneDonationRequestSchema.parse(v)),
	async (c) => {
		const body = c.req.valid("json") as StandaloneDonationRequest;

		// Create donation invoice
		const donation = await createDonationInvoice(
			body.donationAmountSats,
			c.get("nwcClient"),
		);

		const response: StandaloneDonationResponse = {
			id: donation.id,
			amountSats: donation.amountSats,
			createdAt: donation.createdAt,
			donationInvoice: donation.invoice,
			donationPaymentHash: donation.paymentHash,
		};

		return c.json(response);
	},
);

// Payment status monitoring via SSE
app.get("/payments/:paymentHash/status", async (c) => {
	const paymentHash = c.req.param("paymentHash");

	console.log(`SSE connection established for payment: ${paymentHash}`);

	return streamSSE(
		c,
		async (stream) => {
			// Send initial connection confirmation
			await stream.writeSSE({
				data: "connected" satisfies PaymentStatusEvent,
				event: "connected",
			});

			const unsubscribeFromPayment = subscribeToPayment(
				paymentHash,
				async (status, notification) => {
					console.log(
						`Payment ${paymentHash} status update: ${status}`,
						notification,
					);

					// Send payment status update to client
					await stream.writeSSE({
						data: status satisfies PaymentStatusEvent,
						event: "payment-status",
					});

					unsubscribeFromPayment();
					await stream.close();
				},
			);

			// Keep connection alive with periodic heartbeats
			let heartbeatCount = 0;
			while (true) {
				await stream.sleep(5 * 1000); // 5 second heartbeat, bun has timeout of 10s
				heartbeatCount++;

				// Send heartbeat (with comment to avoid triggering events)
				await stream.writeSSE({
					data: `heartbeat-${heartbeatCount}` satisfies PaymentStatusEvent,
					event: "heartbeat",
				});

				// Optional: Add timeout after a certain period
				if (heartbeatCount > 200) {
					console.log(
						`Payment ${paymentHash} SSE timeout after 100 heartbeats`,
					);
					unsubscribeFromPayment();
					await stream.close();
					break;
				}
			}
		},
		async (err, stream) => {
			console.error(`SSE error for payment ${paymentHash}:`, err);
			await stream.close();
		},
	);
});

await initializeDonationPaymentMonitoring(nwcClient).then(() => {
	console.log("Server ready with payment monitoring active");
});

// Handle shutdown gracefully
process.on("SIGINT", async () => {
	console.log("\nReceived SIGINT, shutting down gracefully...");
	shutdownDonationPaymentMonitoring();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\nReceived SIGTERM, shutting down gracefully...");
	shutdownDonationPaymentMonitoring();
	process.exit(0);
});

export default app;
