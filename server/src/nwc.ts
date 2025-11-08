import { NWCClient } from "@getalby/sdk/nwc";

if (!process.env.NWC_URL) throw new Error("NWC_URL is not set");
export const nwcClient = new NWCClient({
	nostrWalletConnectUrl: process.env.NWC_URL,
});
