import { Link } from "@tanstack/react-router";
import { GlassCard } from "../components/UI";

export function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
			<div className="container mx-auto px-4 py-8">
				<Navigation />
				<HeroSection />
				<FeaturesGrid />
				<HowItWorksSection />
				<FAQSection />
				<FooterCTA />
			</div>
		</div>
	);
}

export function Navigation() {
	return (
		<nav className="flex justify-between items-center mb-16">
			<div className="text-2xl font-black text-white">🎁 Coin Gift</div>
			<div className="flex gap-4">
				<Link
					to="/create-gift"
					className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all"
				>
					Create Gift
				</Link>
			</div>
		</nav>
	);
}

export function HeroSection() {
	return (
		<div className="text-center max-w-4xl mx-auto">
			<h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
				Send Bitcoin Gifts
				<br />
				<span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
					Anyone Can Claim! ₿<span className="text-white">🚀</span>
				</span>
			</h1>

			<p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
				Create Bitcoin gifts with secret codes. No Bitcoin address needed from
				recipient initially!
				<br />
				Perfect for birthdays, holidays, or just spreading the Bitcoin love. ₿💝
			</p>

			{/* CTA Buttons */}
			<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
				<Link
					to="/create-gift"
					className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-2xl transition-all transform hover:scale-105"
				>
					🎁 Create a Gift
				</Link>
				<button
					type="button"
					className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all border-2 border-white/30"
				>
					📱 Redeem a Gift
				</button>
			</div>
		</div>
	);
}

export function FeaturesGrid() {
	const features = [
		{
			icon: "🔐",
			title: "Secure Bitcoin Storage",
			description:
				"Each gift gets a unique Bitcoin address. Secret codes ensure only the right person can claim the funds.",
		},
		{
			icon: "📱",
			title: "No Bitcoin Address Needed Initially",
			description:
				"Perfect for surprises! Recipient just claims the gift to their Bitcoin address using the secret code.",
		},
		{
			icon: "⏰",
			title: "Gift Expiry",
			description:
				"Gifts expire after a set period with automatic refund to sender. No Bitcoin lost forever!",
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
				"Choose an amount, add a message, and send BTC to our secure escrow",
			gradientFrom: "from-purple-400",
			gradientTo: "to-pink-400",
		},
		{
			stepNumber: 2,
			title: "Share Code",
			description:
				"Get a secret code, QR code, or link to share with your recipient",
			gradientFrom: "from-blue-400",
			gradientTo: "to-purple-400",
		},
		{
			stepNumber: 3,
			title: "Claim Gift",
			description:
				"Recipient enters the code + their Bitcoin address to receive BTC (batched processing)",
			gradientFrom: "from-green-400",
			gradientTo: "to-blue-400",
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
		<GlassCard className="text-center mt-20 p-8">
			<h3 className="text-2xl font-bold text-white mb-4">
				Ready to Send Your First Crypto Gift? 🎉
			</h3>
			<Link
				to="/create-gift"
				className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-2xl transition-all transform hover:scale-105"
			>
				🚀 Get Started Now
			</Link>
		</GlassCard>
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
      <p className="text-white/80">
        {answer}
      </p>
    </div>
  );
}

const faqData = [
  {
    icon: "🔐",
    question: "Is it safe to send crypto gifts?",
    answer: "Yes! Each gift gets a unique Bitcoin address with encrypted private key storage. Only someone with the secret code or the original sender can access the funds. We use high-entropy secret generation and all transactions are on the blockchain."
  },
  {
    icon: "💰",
    question: "What are the fees?",
    answer: "We only charge standard network gas fees for transactions. There are no additional platform fees during our beta phase. You'll see the exact gas cost before confirming any transaction."
  },
  {
    icon: "📱",
    question: "Does the recipient need a crypto wallet?",
    answer: "Recipients need a wallet address to receive the crypto, but they don't need to know how to use wallets beforehand. They can create one on any exchange or use a simple wallet app when they're ready to claim."
  },
  {
    icon: "⏰",
    question: "What happens if the gift isn't claimed?",
    answer: "Gifts can be configured with expiration dates. If a gift isn't claimed by the expiration date, you can recover your funds."
  },
  {
    icon: "🌐",
    question: "Which cryptocurrencies are supported?",
    answer: "Currently, we support Bitcoin (BTC) gifts. If there's demand, we'll consider adding more cryptocurrencies in the future."
  },
  {
    icon: "🎁",
    question: "What are the gift amount limits?",
    answer: "During beta, gifts can be between $1 and $1,000 USD worth of ETH. This helps us ensure security and manage risk while we're testing the platform."
  },
  {
    icon: "🔑",
    question: "What if I lose the secret code?",
    answer: "As the gift creator, you can always recover your funds using the wallet that created the gift. However, without the secret code, the recipient won't be able to claim it, so keep it safe!"
  },
  {
    icon: "📧",
    question: "Do you store personal information?",
    answer: "We only store optional email addresses for notifications if you provide them. We don't store names, addresses, or other personal data. The gift system is designed to be as private as possible."
  }
];

export function FAQSection() {
  return (
    <div className="mt-20">
      <h2 className="text-3xl md:text-5xl font-black text-white mb-12 text-center">
        Frequently Asked Questions 🤔
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