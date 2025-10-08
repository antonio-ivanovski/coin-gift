import { clsx } from "clsx";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { DEFAULT_DONATION_AMOUNT, MIN_DONATION_AMOUNT } from "shared";
import { DonationAmountSelector } from "../components/DonationAmountSelector";
import { GlassCard, GradientButton } from "../components/UI";
import { useStandaloneDonation, useWaitlistSignup } from "../hooks/useApi";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { usePaymentStatus } from "../hooks/usePaymentStatus";

export function WaitlistPage() {
	const [activeTab, setActiveTab] = useState<"waitlist" | "donate">("waitlist");

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-yellow-400">
			<div className="container mx-auto px-4 py-8">
				{/* Hero Section */}
				<div className="text-center max-w-4xl mx-auto mb-16">
					<h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
						🎁 Coin Gift
						<br />
						<span className="bg-gradient-to-r from-yellow-200 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
							Coming Soon ⚡
						</span>
					</h1>

					<p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
						Send Bitcoin gifts with secret codes via Lightning Network
						<br />
						Join the waitlist or support development 💝
					</p>
				</div>

				{/* Tab Navigation */}
				<div className="max-w-md mx-auto mb-8">
					<div className="flex bg-white/10 rounded-xl p-1 backdrop-blur-sm">
						<button
							onClick={() => setActiveTab("waitlist")}
							className={clsx(
								"flex-1 py-3 px-4 rounded-lg font-semibold transition-all cursor-pointer",
								activeTab === "waitlist"
									? "bg-white text-gray-900"
									: "text-white hover:bg-white/10",
							)}
						>
							📧 Join Waitlist
						</button>
						<button
							onClick={() => setActiveTab("donate")}
							className={clsx(
								"flex-1 py-3 px-4 rounded-lg font-semibold transition-all cursor-pointer",
								activeTab === "donate"
									? "bg-white text-gray-900"
									: "text-white hover:bg-white/10",
							)}
						>
							💝 Support Dev
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="max-w-md mx-auto">
					{activeTab === "waitlist" ? <WaitlistForm /> : <DonationForm />}
				</div>

				{/* Footer */}
				<div className="text-center mt-16">
					<p className="text-white/60 text-sm">
						Want to learn more? Check out the{" "}
						<a
							href="https://github.com/antonio-ivanovski/coin-gift"
							target="_blank"
							className="text-yellow-300 hover:text-yellow-200 underline"
						>
							source code on GitHub
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function WaitlistForm() {
	const [email, setEmail] = useState("");
	const [donationAmount, setDonationAmount] = useState(DEFAULT_DONATION_AMOUNT);
	const [includeDonation, setIncludeDonation] = useState(true);

	const waitlistSignupMutation = useWaitlistSignup();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await waitlistSignupMutation.mutateAsync({
			email,
			donationAmountSats: includeDonation ? donationAmount : undefined,
		});
	};

	// Show invoice first if donation was included
	if (
		waitlistSignupMutation.isSuccess &&
		waitlistSignupMutation.data.donationInvoice &&
		waitlistSignupMutation.data.donationPaymentHash
	) {
		return (
			<WaitlistInvoice
				invoice={waitlistSignupMutation.data.donationInvoice}
				paymentHash={waitlistSignupMutation.data.donationPaymentHash}
			/>
		);
	}

	// todo: show success message after invoice is paid
	if (waitlistSignupMutation.isSuccess) {
		return <WaitlistSuccess email={email} />;
	}

	return (
		<GlassCard className="p-8">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold text-white mb-2">Get Early Access</h2>
				<p className="text-white/80">Be first to know when we launch</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Error message */}
				{waitlistSignupMutation.isError && (
					<div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
						<p className="text-red-300 text-sm">
							{waitlistSignupMutation.error?.message ||
								"Failed to join waitlist. Please try again."}
						</p>
					</div>
				)}

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-semibold text-white mb-2"
					>
						Email Address
					</label>
					<input
						id="email"
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="your@email.com"
						className="w-full p-4 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:border-yellow-400 focus:outline-none backdrop-blur-sm"
					/>
				</div>

				{/* Optional Donation Section */}
				<div className="bg-white/5 rounded-xl p-4 border border-white/20">
					<div className="flex items-center justify-between mb-4">
						<label className="text-sm font-semibold text-white">
							💝 Include Donation
						</label>
						<button
							type="button"
							onClick={() => setIncludeDonation(!includeDonation)}
							className={clsx(
								"w-12 h-6 rounded-full transition-colors",
								includeDonation ? "bg-yellow-400" : "bg-white/20",
							)}
						>
							<div
								className={clsx(
									"w-5 h-5 rounded-full bg-white transition-transform",
									includeDonation ? "translate-x-6" : "translate-x-0.5",
								)}
							/>
						</button>
					</div>

					{includeDonation && (
						<div className="space-y-3">
							<p className="text-xs text-white/70">
								Support development with your waitlist signup
							</p>
							<DonationAmountSelector
								amount={donationAmount}
								minAmount={MIN_DONATION_AMOUNT}
								onChange={setDonationAmount}
							/>
						</div>
					)}
				</div>

				<GradientButton
					type="submit"
					disabled={
						waitlistSignupMutation.isPending ||
						!EMAIL_REGEX.test(email) ||
						(includeDonation && donationAmount < MIN_DONATION_AMOUNT)
					}
					className="w-full"
					gradientFrom="from-yellow-500"
					gradientTo="to-orange-500"
					hoverFrom="hover:from-yellow-600"
					hoverTo="hover:to-orange-600"
				>
					{waitlistSignupMutation.isPending ? (
						<span className="flex items-center justify-center gap-2">
							<div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
							Joining...
						</span>
					) : (
						"⚡ Join Waitlist"
					)}
				</GradientButton>
			</form>

			<div className="text-center mt-6">
				<p className="text-xs text-white/60">No spam, unsubscribe anytime</p>
			</div>
		</GlassCard>
	);
}

function DonationForm() {
	const [donationAmount, setDonationAmount] = useState(DEFAULT_DONATION_AMOUNT);

	const donationMutation = useStandaloneDonation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		donationMutation.mutate({ donationAmountSats: donationAmount });
	};

	if (donationMutation.isSuccess) {
		return (
			<WaitlistInvoice
				invoice={donationMutation.data.donationInvoice}
				paymentHash={donationMutation.data.donationPaymentHash}
			/>
		);
	}

	return (
		<GlassCard className="p-8">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold text-white mb-2">
					Support Development
				</h2>
				<p className="text-white/80">Help fund Coin Gift with Lightning ⚡</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Error message */}
				{donationMutation.isError && (
					<div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
						<p className="text-red-300 text-sm">
							{donationMutation.error?.message ||
								"Failed to create donation. Please try again."}
						</p>
					</div>
				)}

				<div>
					<label className="block text-sm font-semibold text-white mb-3">
						Donation Amount (Satoshis)
					</label>
					<DonationAmountSelector
						amount={donationAmount}
						onChange={setDonationAmount}
						minAmount={MIN_DONATION_AMOUNT}
					/>
				</div>

				<GradientButton
					type="submit"
					disabled={
						donationMutation.isPending || donationAmount < MIN_DONATION_AMOUNT
					}
					className="w-full"
					gradientFrom="from-purple-500"
					gradientTo="to-blue-500"
					hoverFrom="hover:from-purple-600"
					hoverTo="hover:to-blue-600"
				>
					{donationMutation.isPending ? (
						<span className="flex items-center justify-center gap-2">
							<div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
							Creating Invoice...
						</span>
					) : (
						"💝 Create Donation Invoice"
					)}
				</GradientButton>
			</form>

			<div className="text-center mt-6">
				<p className="text-xs text-white/60">
					Your donation helps fund development and hosting
				</p>
			</div>
		</GlassCard>
	);
}

function WaitlistInvoice({
	invoice,
	paymentHash,
}: {
	invoice: string;
	paymentHash: string;
}) {
	const copyMutation = useCopyToClipboard();
	const payment = usePaymentStatus(paymentHash);

	// Show success message when payment is settled
	if (payment.data === "settled") {
		return (
			<GlassCard className="p-8 text-center">
				<div className="text-6xl mb-6">🎉</div>
				<h2 className="text-3xl font-bold text-white mb-4">
					Payment Received!
				</h2>
				<p className="text-white/80 mb-6 text-lg">
					Thank you for supporting Coin Gift development! ⚡
				</p>

				<div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6 mb-6">
					<div className="flex items-center justify-center gap-2 mb-2">
						<span className="text-green-400 text-2xl">✅</span>
						<span className="text-green-300 font-semibold">
							Payment Confirmed
						</span>
					</div>
					<p className="text-green-200/80 text-sm">
						Your transaction has been settled on the Lightning Network
					</p>
				</div>

				<div className="space-y-4">
					<button
						onClick={() => window.location.reload()}
						className="text-white/60 hover:text-white/80 text-sm underline cursor-pointer"
					>
						← Make another donation
					</button>
				</div>
			</GlassCard>
		);
	}

	// Show error/failed message
	if (payment.isError || payment.data === "failed") {
		return (
			<GlassCard className="p-8 text-center">
				<div className="text-6xl mb-6">❌</div>
				<h2 className="text-3xl font-bold text-white mb-4">Payment Failed</h2>
				<p className="text-white/80 mb-6">
					{payment.isError
						? "There was an error monitoring the payment status."
						: "The payment was not completed successfully."}
				</p>

				<div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6 mb-6">
					<p className="text-red-300 text-sm mb-4">
						{payment.isError
							? payment.error?.message || "Connection error occurred"
							: "The Lightning invoice was not paid or has expired"}
					</p>
					<p className="text-red-200/70 text-xs">
						Please go back and create a new invoice to try again
					</p>
				</div>

				<div className="space-y-4">
					<button
						onClick={() => window.location.reload()}
						className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
					>
						← Go Back and Try Again
					</button>
				</div>
			</GlassCard>
		);
	}

	// Show invoice and waiting state
	return (
		<GlassCard className="p-8 text-center">
			<div className="text-4xl mb-4">⚡</div>
			<h2 className="text-2xl font-bold text-white mb-4">
				Complete Your Donation
			</h2>
			<p className="text-white/80 mb-6">
				Thank you for supporting Coin Gift development!
			</p>

			<div className="bg-white/5 rounded-xl p-6 border border-white/20 mb-6">
				<h3 className="text-sm font-bold text-white mb-4">Lightning Invoice</h3>

				{/* QR Code */}
				<div className="flex justify-center mb-4">
					<QRCodeSVG
						value={invoice}
						className="w-64 h-64 rounded-lg bg-white p-2"
					/>
				</div>

				<div className="bg-white/10 rounded-lg p-3 mb-4">
					<div className="text-xs font-mono text-white break-all">
						{invoice}
					</div>
				</div>

				<div className="flex gap-2 justify-center">
					<button
						onClick={() => copyMutation.mutate(invoice)}
						className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
					>
						{copyMutation.isSuccess ? "✅ Copied!" : "📋 Copy Invoice"}
					</button>
				</div>
			</div>

			{/* Waiting for payment indicator */}
			{payment.isLoading && (
				<div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-6">
					<div className="flex items-center justify-center gap-3">
						<div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
						<span className="text-blue-300 font-medium">
							Waiting for payment...
						</span>
					</div>
					<p className="text-blue-200/70 text-xs mt-2">
						Scan the QR code with your Lightning wallet
					</p>
				</div>
			)}

			<div className="space-y-4">
				<button
					onClick={() => window.location.reload()}
					className="text-white/60 hover:text-white/80 text-sm underline cursor-pointer"
				>
					← Back to form
				</button>
			</div>
		</GlassCard>
	);
}

function WaitlistSuccess({ email }: { email: string }) {
	return (
		<GlassCard className="p-8 text-center">
			<div className="text-4xl mb-4">🎉</div>
			<h2 className="text-2xl font-bold text-white mb-4">
				Welcome to the Waitlist!
			</h2>
			<p className="text-white/80 mb-6">
				Thanks <span className="font-bold">{email}</span>! You'll be among the
				first to know when we launch.
			</p>

			<div className="bg-white/5 rounded-xl p-4 border border-white/20 mb-6">
				<h3 className="text-lg font-bold text-white mb-4">What's Next?</h3>
				<ul className="text-white/80 space-y-2 text-left max-w-md mx-auto">
					<li className="flex items-start gap-2">
						<span className="text-yellow-400">•</span>
						<span>We'll email you when we launch (coming soon!)</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-yellow-400">•</span>
						<span>Early access to beta features and testing</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-yellow-400">•</span>
						<span>Exclusive tips and tutorials for Lightning gifts</span>
					</li>
				</ul>
			</div>

			<div className="space-y-4">
				<button
					onClick={() => window.location.reload()}
					className="text-white/60 hover:text-white/80 text-sm underline cursor-pointer"
				>
					← Join again or make another donation
				</button>
			</div>
		</GlassCard>
	);
}
