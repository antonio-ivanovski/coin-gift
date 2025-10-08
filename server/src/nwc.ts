import { NWCClient } from "@getalby/sdk/nwc";

console.log(
	"env",
	JSON.stringify(
		{
			TEST_SECRET: process.env.TEST_SECRET ?? "not set",
			NWC_URL: process.env.NWC_URL ?? "not set",
			NCW_URL: process.env.NCW_URL ?? "not set",
		},
		null,
		2,
	),
);
if (!process.env.NWC_URL) throw new Error("NWC_URL is not set");
export const nwcClient = new NWCClient({
	nostrWalletConnectUrl: process.env.NWC_URL,
});
