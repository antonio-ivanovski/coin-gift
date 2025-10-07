export function DonationAmountSelector({ 
	amount, 
	onChange, 
	className
}: { 
	amount: number; 
	onChange: (amount: number) => void; 
	className?: string;
}) {
	return (
		<div className={className}>
			<div className="grid grid-cols-3 gap-2 mb-4">
				{[2100, 5000, 10000].map((presetAmount) => (
					<button
						type="button"
						key={presetAmount}
						onClick={() => onChange(presetAmount)}
						className={`p-3 rounded-lg text-sm font-bold transition-all ${
							amount === presetAmount
								? "bg-yellow-400 text-gray-900"
								: "bg-white/10 text-white border border-white/20 hover:bg-white/20"
						}`}
					>
						{presetAmount} sats
					</button>
				))}
			</div>
			<input
				type="number"
				value={amount}
				onChange={(e) => onChange(Number(e.target.value))}
				min="1000"
				max="100000"
				className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-yellow-400 focus:outline-none"
				placeholder="Custom amount"
			/>
			<p className="text-xs text-white/60 mt-2">
				≈ ${((amount / 100000000) * 100000).toFixed(2)} USD
			</p>
		</div>
	);
}