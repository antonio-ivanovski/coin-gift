import type { NWCClient } from "@getalby/sdk/nwc";
import { Hono } from "hono";
import { createBunWebSocket, serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { streamSSE } from "hono/streaming";
import { validator } from "hono/validator";
import {
	type InitGiftResponse,
	initGiftRequestSchema,
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

export const app = new Hono<Env>();

// Only use CORS in development
if (process.env.NODE_ENV !== "production") {
	app.use(cors());
}

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
	"/api/waitlist/signup",
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
	"/api/waitlist/donate",
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

const { upgradeWebSocket, websocket } = createBunWebSocket();
app.get(
	"/ws",
	upgradeWebSocket((c) => {
		let intervalId: NodeJS.Timeout;
		return {
			onOpen(_event, ws) {
				intervalId = setInterval(() => {
					ws.send(new Date().toString());
				}, 1000);
			},
			onClose() {
				clearInterval(intervalId);
			},
		};
	}),
);

let id = 0;
app.get("/sse", async (c) => {
	console.log("SSE connection established");
	return streamSSE(
		c,
		async (stream) => {
			console.log("Starting SSE stream");
			while (true) {
				const message = `It is ${new Date().toISOString()}`;
				console.log("Sending SSE message:", message);
				await stream.writeSSE({
					data: message,
					event: "time-update",
					id: String(id++),
				});
				console.log("SSE message sent:", message);
				console.log("SSE stream sleeping for 1 second");
				await stream.sleep(3000);
				console.log("SSE stream woke up");
			}
		},
		async (e, stream) => {
			console.error("SSE stream error:", e);
			await stream.close();
		},
	);
});

// Serve static files for everything else
app.use("*", serveStatic({ root: "./static" }));

app.get("*", async (c, next) => {
	return serveStatic({ root: "./static", path: "index.html" })(c, next);
});

export default {
	fetch: app.fetch,
	websocket,
};
