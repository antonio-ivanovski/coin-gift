import crypto from "node:crypto";
import type { NWCClient } from "@getalby/sdk";
import { zValidator as zv } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { validator } from "hono/validator";
import { type InitGiftResponse, initGiftRequestSchema } from "shared/dist";
import z from "zod";
import { encryptPreimage } from "./encryption";
import { initiateGiftInvoices } from "./initiateGifts";
import {
	type GiftsToStore,
	type GiftToStore,
	getGiftsBatch,
	storeGifts,
} from "./storage";

type Env = {
	Bindings: {};
	Variables: {
		nwcClient: NWCClient;
	};
};

export const app = new Hono<Env>().use(cors());

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

// TODO: need to store invoice in order to watch for status

app.post(
	"/complete-gifts/:giftsId",
	validator("param", (v) => z.object({ giftsId: z.string() }).parse(v)),
	async (c) => {
		const { giftsId } = c.req.valid("param");
		const giftBatch = await getGiftsBatch(giftsId);
		if (!giftBatch) return c.notFound();
	},
);

export default app;
