import { Link } from "@tanstack/react-router";
import { GlassCard } from "../components/UI";

export function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-yellow-400">
			<div className="container mx-auto px-4 py-8">
				<HeroSection />
				<FeaturesGrid />
				<HowItWorksSection />
				<FAQSection />
				<FooterCTA />
			</div>
		</div>
	);
}

export function HeroSection() {
	return (
		<div className="text-center max-w-4xl mx-auto">
			<h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
				Send Bitcoin Gifts
				<br />
				<span className="bg-gradient-to-r from-yellow-200 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
					Instant & Secure! <span className="text-white">🎁</span>
				</span>
			</h1>

			<p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
				Create Bitcoin gifts with secret codes. Recipients claim instantly via Lightning Network!
				<br />
				Perfect for birthdays, holidays, or spreading Bitcoin adoption ⚡💝
			</p>

			{/* CTA Buttons */}
			<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
				<Link
					to="/create-gift"
					className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-2xl transition-all transform hover:scale-105 border border-purple-400"
				>
					⚡ Create Bitcoin Gift
				</Link>
				<button
					type="button"
					className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all border-2 border-white/30"
				>
					🎁 Redeem a Gift
				</button>
			</div>
		</div>
	);
}

export function FeaturesGrid() {
	const features = [
		{
			icon: "⚡",
			title: "Lightning Fast & Secure",
			description:
				"Hold invoices keep funds in your wallet until claimed. Lightning Network enables instant settlements with minimal fees.",
		},
		{
			icon: "🔐",
			title: "Encrypted Secret Storage",
			description:
				"Preimage is encrypted with recipient's secret. Only the right person with the code can release the Lightning payment.",
		},
		{
			icon: "🎁",
			title: "Any Lightning Wallet",
			description:
				"Recipients can claim to any Lightning wallet. Perfect for introducing friends to Bitcoin with instant, low-fee transactions.",
		},
	];

	return (
		<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
			{features.map((feature) => (
				<GlassCard key={feature.title} className="p-6">
					<div className="text-4xl mb-4">{feature.icon}</div>
					<h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
					<p className="text-white/80">{feature.description}</p>
				</GlassCard>
			))}
		</div>
	);
}

export function HowItWorksSection() {
	const steps = [
		{
			stepNumber: 1,
			title: "Create Gift",
			description:
				"Choose amount, generate secret code, and pay Lightning invoice - funds are held in your wallet until claimed",
			gradientFrom: "from-purple-400",
			gradientTo: "to-blue-400",
		},
		{
			stepNumber: 2,
			title: "Share Redemption Secret",
			description:
				"Share QR code, link, or secret code with the recipient of the gift - they're the key to unlock the gift funds",
			gradientFrom: "from-blue-400",
			gradientTo: "to-yellow-400",
		},
		{
			stepNumber: 3,
			title: "Instant Lightning Claim",
			description:
				"Recipient enters code, provides Lightning invoice, and receives instant Bitcoin via Lightning Network",
			gradientFrom: "from-yellow-400",
			gradientTo: "to-purple-400",
		},
	];

	return (
		<div className="mt-20 text-center">
			<h2 className="text-3xl md:text-5xl font-black text-white mb-12">
				How It Works ✨
			</h2>

			<div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
				{steps.map((step) => (
					<div key={step.stepNumber} className="text-center">
						<div
							className={`bg-gradient-to-r ${step.gradientFrom} ${step.gradientTo} w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white mx-auto mb-4`}
						>
							{step.stepNumber}
						</div>
						<h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
						<p className="text-white/80">{step.description}</p>
					</div>
				))}
			</div>
		</div>
	);
}

export function FooterCTA() {
	return (
		<div className="text-center p-8">
			<h3 className="text-2xl font-bold text-white mb-8">
				Ready to Send Your First Bitcoin Gift? ⚡🎉
			</h3>
			<Link
				to="/create-gift"
				className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-2xl transition-all transform hover:scale-105 border border-purple-400"
			>
				⚡ Create Bitcoin Gift
			</Link>
		</div>
	);
}

interface FAQItemProps {
	icon: string;
	question: string;
	answer: string;
}

export function FAQItem({ icon, question, answer }: FAQItemProps) {
	return (
		<div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
			<h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
				{icon} {question}
			</h3>
			<p className="text-white/80">{answer}</p>
		</div>
	);
}

const faqData = [
	{
		icon: "⚡",
		question: "How does Lightning Network gift security work?",
		answer:
			"Your funds stay in YOUR wallet using hold invoices until the recipient claims. The app stores an encrypted preimage that only the recipient's secret code can decrypt. Even if our systems are compromised, your funds remain secure in your Lightning wallet.",
	},
	{
		icon: "🆓",
		question: "Are there any fees?",
		answer:
			"The service is completely free! You only pay tiny Lightning Network routing fees (<$0.01). Optional donations help support development, but the platform itself charges zero fees.",
	},
	{
		icon: "📱",
		question: "What Lightning wallets work for recipients?",
		answer:
			"Any Lightning wallet! Recipients can use mobile wallets like Phoenix, Wallet of Satoshi, or browser wallets with WebLN support. They just need to generate a Lightning invoice to receive the gift.",
	},
	{
		icon: "⏰",
		question: "What happens if the gift isn't claimed?",
		answer:
			"Gifts expire after 30 days by default (configurable when creating). If unclaimed, the hold invoice automatically releases funds back to your wallet - no manual recovery needed!",
	},
	{
		icon: "🔐",
		question: "How secure are the secret codes?",
		answer:
			"We use high-entropy secret generation (32+ characters) and store only hashed versions. The preimage needed to release Lightning payments is encrypted with the secret code, so only the recipient can unlock it.",
	},
	{
		icon: "🎁",
		question: "What are the gift amount limits?",
		answer:
			"Perfect for $1 to $100+ gifts! Lightning Network's low fees make even small amounts cost-effective. Batch gifting is also supported for sending multiple gifts efficiently.",
	},
	{
		icon: "🔑",
		question: "What if I lose the secret code?",
		answer:
			"As the gift creator, you can cancel the hold invoice from your Lightning wallet if needed. However, without the secret code, the recipient won't be able to claim it, so keep it safe and share it securely!",
	},
	{
		icon: "📕",
		question: "Do you store personal information?",
		answer:
			"Minimal data storage! We only keep gift metadata and encrypted preimages. No personal information, wallet details, or payment history is stored. The system is designed for maximum privacy.",
	},
];

export function FAQSection() {
	return (
		<div className="mt-20">
			<h2 className="text-3xl md:text-5xl font-black text-white mb-12 text-center">
				Frequently Asked Questions ⚡🤔
			</h2>

			<div className="max-w-4xl mx-auto space-y-6">
				{faqData.map((faq) => (
					<FAQItem
						key={faq.question}
						icon={faq.icon}
						question={faq.question}
						answer={faq.answer}
					/>
				))}
			</div>
		</div>
	);
}
