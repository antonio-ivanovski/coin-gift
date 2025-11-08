import { clsx } from "clsx";
import { useBtcPrice } from "../hooks/btcPrice";

export function DonationAmountSelector({
	amount,
	onChange,
	className,
	minAmount,
}: {
	amount: number;
	onChange: (amount: number) => void;
	className?: string;
	minAmount: number;
}) {
	const btcPriceQuery = useBtcPrice();
	return (
		<div className={className}>
			<div className="grid grid-cols-3 gap-2 mb-4">
				{[1_000, 2_000, 5_000].map((presetAmount) => (
					<button
						type="button"
						key={presetAmount}
						onClick={() => onChange(presetAmount)}
						className={clsx(
							"p-3 rounded-lg text-sm font-bold transition-all",
							amount === presetAmount
								? "bg-yellow-400 text-gray-900"
								: "bg-white/10 text-white border border-white/20 hover:bg-white/20",
						)}
					>
						{presetAmount} sats
					</button>
				))}
			</div>
			<input
				type="number"
				value={amount === 0 ? "" : amount}
				onChange={(e) => onChange(Number(e.target.value))}
				min={minAmount}
				max="100000"
				className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-yellow-400 focus:outline-none"
				placeholder="Custom amount"
			/>
			<div className="mt-2 space-y-1">
				{btcPriceQuery.isSuccess ? (
					<p className="text-xs text-white/60">
						≈ ${(amount * btcPriceQuery.data.satsPrice).toFixed(2)} USD
					</p>
				) : btcPriceQuery.isPending ? (
					<p className="text-xs text-white/60">Loading price...</p>
				) : (
					<p className="text-xs text-white/60">Failed to load price</p>
				)}
				<p className="text-xs text-white/50">
					Minimum donation: {minAmount} sats
				</p>
			</div>
		</div>
	);
}
