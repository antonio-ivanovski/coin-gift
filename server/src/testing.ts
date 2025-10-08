// import "websocket-polyfill";
import { NWCClient } from "@getalby/sdk/nwc";

const nwcConnectionCode = "<YOUR_NWC_CONNECTION_CODE_HERE>";

const nwcClient = new NWCClient({ nostrWalletConnectUrl: nwcConnectionCode });
nwcClient.makeHoldInvoice;
const invoice = await nwcClient.makeInvoice({ amount: 1 });
console.log("Invoice:", invoice);

nwcClient.subscribeNotifications((notification) => {
	console.log("Notification:", notification);
});
