import { Link } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import {
	useBTCPrice,
	useCreateGift,
	useGiftPaymentMonitoring,
} from "../hooks/useApi";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

interface GiftData {
	sats: number;
	title: string;
	message: string;
	occasionType:
		| "birthday"
		| "holiday"
		| "thank-you"
		| "love"
		| "congratulations"
		| "custom";
	emoji: string;
	notificationEmail: string;
	paymentAddress?: string;
	giftId?: string;
}

const PRESET_SATS_AMOUNTS = [10000, 50000, 100000, 250000, 500000]; // ~$10, $50, $100, $250, $500 at $100k BTC

const OCCASIONS: Pick<
	GiftData,
	"occasionType" | "title" | "emoji" | "message"
>[] = [
	{
		occasionType: "birthday",
		title: "Happy Birthday!",
		message: "Hope you have an amazing day filled with joy and surprises! 🎉🎂",
		emoji: "🎂",
	},
	{
		occasionType: "love",
		title: "Love You!",
		message: "You're the best! Sending you all my love. ❤️",
		emoji: "❤️",
	},
	{
		occasionType: "holiday",
		title: "Happy Holidays!",
		message: "Warm wishes for a joyful holiday!",
		emoji: "🎄",
	},
	{
		occasionType: "thank-you",
		title: "Thank You!",
		message: "Thanks a bunch! You're awesome! 🙏",
		emoji: "🙏",
	},
	{
		occasionType: "congratulations",
		title: "Congratulations!",
		message: "Congrats on your achievement! 🎉",
		emoji: "🎉",
	},
	{
		occasionType: "custom",
		title: "Special Gift",
		message: "A special gift just for you!",
		emoji: "✨",
	},
];

const EMOJI_OPTIONS = [
	"⚡",
	"🎁",
	"🎂",
	"🙏",
	"💎",
	"🚀",
	"🌙",
	"💜",
	"❤️",
	"💝",
	"🔥",
	"💰",
	"🎉",
	"🎄",
	"🦄",
	"🌈",
	"✨",
	"💫",
];

const SATS_PER_BTC = 100000000;

// Component Props Interfaces
interface StepHeaderProps {
	icon: string;
	title: string;
}

interface ProgressStepsProps {
	currentStep: number;
}

interface AmountSelectionProps {
	giftData: GiftData;
	onAmountChange: (sats: number) => void;
	btcPrice: { usd: number; source: string };
	btcPriceLoading?: boolean;
	btcPriceError?: Error | null;
}

interface OccasionPickerProps {
	giftData: GiftData;
	onOccasionSelect: (
		occasion: Pick<GiftData, "occasionType" | "title" | "emoji" | "message">,
	) => void;
}

interface EmojiPickerProps {
	selectedEmoji: string;
	onEmojiSelect: (emoji: string) => void;
}

interface RedemptionItemProps {
	title: string;
	icon: string;
	value: string;
	isRevealed: boolean;
	onToggleReveal: () => void;
	onCopy: () => void;
	isCopied: boolean;
	className?: string;
}

interface QRCodeSectionProps {
	onDownload: () => void;
}

// Extracted Components
function StepHeader({ icon, title }: StepHeaderProps) {
	return (
		<div className="flex items-center gap-3 mb-6">
			<span className="text-2xl">{icon}</span>
			<h2 className="text-2xl font-bold text-gray-800">{title}</h2>
		</div>
	);
}

function ProgressSteps({ currentStep }: ProgressStepsProps) {
	return (
		<div className="flex justify-center mb-8">
			<div className="flex items-center space-x-2 bg-white/20 rounded-full p-2 backdrop-blur-sm">
				{[1, 2, 3, 4].map((step) => (
					<div key={step} className="flex items-center">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
								currentStep >= step
									? "bg-white text-orange-600 shadow-lg"
									: "bg-white/30 text-white"
							}`}
						>
							{step}
						</div>
						{step < 4 && (
							<div
								className={`w-8 h-1 mx-1 rounded-full transition-all ${
									currentStep > step ? "bg-white" : "bg-white/30"
								}`}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

function AmountSelection({
	giftData,
	onAmountChange,
	btcPrice,
	btcPriceError,
}: AmountSelectionProps) {
	return (
		<div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl border-4 border-white/50">
			<StepHeader icon="💰" title="Choose Amount" />

			<div className="mb-6">
				<div className="block text-sm font-semibold text-gray-700 mb-3">
					Gift Amount (Satoshis)
				</div>
				<div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
					{PRESET_SATS_AMOUNTS.map((sats) => (
						<button
							type="button"
							key={sats}
							onClick={() =>
								onAmountChange(sats)
							}
							className={`p-3 rounded-xl font-bold transition-all border-2 ${
								giftData.sats === sats
									? "bg-amber-500 text-white border-amber-600 shadow-lg scale-105"
									: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-200"
							}`}
						>
							{sats} SATS
						</button>
					))}
					<input
						type="number"
						placeholder="Custom"
						value={giftData.sats || ''}
						onChange={(e) => {
							const sats = Number(e.target.value);
							onAmountChange(sats);
						}}
						className="p-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none font-semibold text-center"
						min="0.0001"
						max="0.01"
						step="0.0001"
					/>
				</div>
				<div className="text-xs text-gray-500 text-center">
					Choose your gift amount in Satoshis
					<div>
					{`1 BTC = ${SATS_PER_BTC.toLocaleString()} SATS`}
					</div>
					{btcPrice && (
						<div className="mt-1 text-amber-600">
							Current BTC Price: ${btcPrice.usd.toLocaleString()}
						</div>
					)}
					{btcPriceError && (
						<div className="mt-1 text-red-500 text-xs">
							⚠️ Using fallback BTC price due to API error
						</div>
					)}
				</div>
			</div>

			{giftData.sats > 0 && (
				<div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-2xl border-2 border-orange-200">
					<div className="text-center">
						<div className="text-3xl font-black text-orange-800">
							{giftData.sats} SATS
						</div>
						<div className="text-sm text-orange-600 mt-1">
							{`${giftData.sats.toLocaleString()} sats ≈ ${giftData.sats / SATS_PER_BTC} BTC ≈ $${((giftData.sats / SATS_PER_BTC) * btcPrice.usd).toFixed(2)} USD`}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function OccasionPicker({ giftData, onOccasionSelect }: OccasionPickerProps) {
	return (
		<div className="mb-6">
			<div className="block text-sm font-semibold text-gray-700 mb-3">
				Choose Occasion
			</div>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{OCCASIONS.map((preset) => (
					<button
						type="button"
						key={preset.occasionType}
						onClick={() => onOccasionSelect(preset)}
						className={`p-3 rounded-xl font-medium transition-all border-2 text-left ${
							giftData.occasionType === preset.occasionType
								? "bg-amber-500 text-white border-amber-600 shadow-lg"
								: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-200"
						}`}
					>
						{preset.emoji} {preset.title.replace("!", "")}
					</button>
				))}
			</div>
		</div>
	);
}

function EmojiPicker({ selectedEmoji, onEmojiSelect }: EmojiPickerProps) {
	return (
		<div className="mb-6">
			<div className="block text-sm font-semibold text-gray-700 mb-3">
				Gift Emoji
			</div>
			<div className="flex flex-wrap gap-2">
				{EMOJI_OPTIONS.map((emoji) => (
					<button
						type="button"
						key={emoji}
						onClick={() => onEmojiSelect(emoji)}
						className={`w-12 h-12 rounded-xl text-2xl transition-all border-2 ${
							selectedEmoji === emoji
								? "bg-yellow-400 border-yellow-500 shadow-lg scale-110"
								: "bg-gray-100 border-gray-200 hover:bg-yellow-100 hover:border-yellow-300"
						}`}
					>
						{emoji}
					</button>
				))}
			</div>
		</div>
	);
}

function RedemptionItem({
	title,
	icon,
	value,
	isRevealed,
	onToggleReveal,
	onCopy,
	isCopied,
	className = "text-sm",
}: RedemptionItemProps) {
	const maskString = (str: string, showLength: number = 8) => {
		return (
			str.slice(0, showLength) +
			"•".repeat(Math.max(0, str.length - showLength))
		);
	};

	return (
		<div className="mb-6 p-4 bg-gray-50 rounded-2xl">
			<div className="block text-sm font-semibold text-gray-700 mb-2">
				{icon} {title}
			</div>
			<div className="flex items-center gap-2">
				<div
					className={`flex-1 p-3 bg-white rounded-xl border-2 font-mono ${className} ${className.includes("break-all") ? "" : ""}`}
				>
					{isRevealed
						? value
						: maskString(value, title.includes("Link") ? 30 : 8)}
				</div>
				<button
					type="button"
					onClick={onToggleReveal}
					className="p-3 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors"
				>
					{isRevealed ? "🙈" : "👁️"}
				</button>
				<button
					type="button"
					onClick={onCopy}
					className="p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
				>
					{isCopied ? "✅" : "📋"}
				</button>
			</div>
		</div>
	);
}

function QRCodeSection({ onDownload }: QRCodeSectionProps) {
	return (
		<div className="mb-6 p-4 bg-gray-50 rounded-2xl text-center">
			<div className="block text-sm font-semibold text-gray-700 mb-4">
				📱 QR Code
			</div>
			<div className="inline-block p-4 bg-white rounded-2xl border-2">
				<div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
					<div className="text-6xl">📱</div>
					<div className="text-xs text-gray-500 ml-2">
						QR Code
						<br />
						Preview
					</div>
				</div>
				<button
					type="button"
					onClick={onDownload}
					className="bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors font-medium"
				>
					📥 Download PNG
				</button>
			</div>
		</div>
	);
}

export function CreateGiftPage() {
	const titleId = useId();
	const messageId = useId();
	const emailId = useId();
	const [currentStep, setCurrentStep] = useState(1);
	const [giftData, setGiftData] = useState<GiftData>({
		sats: 0,
		title: "",
		message: "",
		occasionType: "custom",
		emoji: "🎁",
		notificationEmail: "",
	});

	// Mock gift receipt data
	const [giftReceipt] = useState({
		redemptionCode: "GIFT-MOON-ROCKET-DIAMOND-HANDS-2024",
		redemptionUrl:
			"https://coin-gift.app/redeem/GIFT-MOON-ROCKET-DIAMOND-HANDS-2024",
		qrCodeUrl: "/api/qr/GIFT-MOON-ROCKET-DIAMOND-HANDS-2024",
		expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
	});

	const [revealedCode, setRevealedCode] = useState(false);
	const [revealedUrl, setRevealedUrl] = useState(false);
	const [isGeneratingAddress, setIsGeneratingAddress] = useState(false);
	const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
	const [paymentConfirmed, setPaymentConfirmed] = useState(false);

	// Individual copy mutations for each item
	const copyAddressMutation = useCopyToClipboard();
	const copyCodeMutation = useCopyToClipboard();
	const copyUrlMutation = useCopyToClipboard();

	// Tanstack Query hooks
	const {
		data: btcPrice = { usd: 100_000, source: "fallback" },
		isLoading: btcPriceLoading,
		error: btcPriceError,
	} = useBTCPrice();
	const createGiftMutation = useCreateGift();
	const {
		giftStatus,
		isLoading: statusLoading,
		startMonitoring,
		isAwaitingPayment: queryIsAwaitingPayment,
		isPaymentConfirmed: queryIsPaymentConfirmed,
	} = useGiftPaymentMonitoring(giftData.giftId || null);

	// Effect to handle payment status changes from query
	useEffect(() => {
		if (queryIsPaymentConfirmed && !paymentConfirmed) {
			setPaymentConfirmed(true);
			setIsAwaitingPayment(false);
			setCurrentStep(4);
		}
		if (queryIsAwaitingPayment && giftData.giftId) {
			setIsAwaitingPayment(true);
		}
	}, [
		queryIsPaymentConfirmed,
		queryIsAwaitingPayment,
		paymentConfirmed,
		giftData.giftId,
	]);

	const handleSatsAmountChange = (sats: number) => {
		setGiftData((prev) => ({ ...prev, sats }));
		if (sats > 0 && currentStep === 1) {
			setCurrentStep(2);
		}
	};

	const handleCustomization = () => {
		if (giftData.occasionType && currentStep === 2) {
			setCurrentStep(3);
		}
	};

	const handleConfirmGift = async () => {
		setIsGeneratingAddress(true);

		try {
			// Use Tanstack Query mutation to create gift
			const result = await createGiftMutation.mutateAsync({
				amount_sats: giftData.sats,
				sender_email: giftData.notificationEmail || undefined,
				message: giftData.message || undefined,
				expires_in_days: 30,
			});

			// Update gift data with response
			setGiftData((prev) => ({
				...prev,
				giftId: result.gift_id,
				paymentAddress: result.payment_address,
			}));

			setIsGeneratingAddress(false);
			setIsAwaitingPayment(true);
			setCurrentStep(3);

			// Start monitoring for payment
			startMonitoring();
		} catch (error) {
			console.error("Failed to create gift:", error);
			setIsGeneratingAddress(false);
			// TODO: Show error toast/modal to user
			alert("Failed to create gift. Please try again.");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-500 to-yellow-400 p-4">
			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8 pt-8">
					<div className="mb-4">
						<Link
							to="/"
							className="inline-block text-white/80 hover:text-white transition-colors text-sm"
						>
							← Back to Home
						</Link>
					</div>
					<h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
						Create Bitcoin Gift ⚡
					</h1>
					<p className="text-lg text-white/90 font-medium">
						Send instant Bitcoin gifts with secret codes! ⚡🎁
					</p>
				</div>

				<ProgressSteps currentStep={currentStep} />

				<AmountSelection
					giftData={giftData}
					onAmountChange={handleSatsAmountChange}
					btcPrice={btcPrice}
					btcPriceLoading={btcPriceLoading}
					btcPriceError={btcPriceError}
				/>

				{/* Step 2: Customization (shows when amount is selected) */}
				{currentStep >= 2 && currentStep < 4 && (
					<div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl border-4 border-white/50">
						<StepHeader icon="✨" title="Customize Your Gift" />

						<OccasionPicker
							giftData={giftData}
							onOccasionSelect={(preset) => {
								setGiftData((prev) => ({ ...prev, ...preset }));
								handleCustomization();
							}}
						/>

						{/* Title */}
						<div className="mb-6">
							<label
								htmlFor={titleId}
								className="block text-sm font-semibold text-gray-700 mb-2"
							>
								Gift Title
							</label>
							<input
								id={titleId}
								type="text"
								value={giftData.title}
								onChange={(e) =>
									setGiftData((prev) => ({ ...prev, title: e.target.value }))
								}
								placeholder="Happy Birthday!"
								className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none font-semibold"
								maxLength={100}
							/>
							<div className="text-xs text-gray-500 mt-1">
								{giftData.title.length}/100 characters
							</div>
						</div>

						{/* Message */}
						<div className="mb-6">
							<label
								htmlFor={messageId}
								className="block text-sm font-semibold text-gray-700 mb-2"
							>
								Personal Message (Optional)
							</label>
							<textarea
								id={messageId}
								value={giftData.message}
								onChange={(e) =>
									setGiftData((prev) => ({ ...prev, message: e.target.value }))
								}
								placeholder="Happy birthday! Hope you enjoy your first crypto! 🎉"
								className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:outline-none resize-none"
								rows={3}
								maxLength={250}
							/>
							<div className="text-xs text-gray-500 mt-1">
								{giftData.message.length}/250 characters
							</div>
						</div>

						<EmojiPicker
							selectedEmoji={giftData.emoji}
							onEmojiSelect={(emoji) =>
								setGiftData((prev) => ({ ...prev, emoji }))
							}
						/>

						{/* Email for Notifications */}
						<div className="mb-4">
							<label
								htmlFor={emailId}
								className="block text-sm font-semibold text-gray-700 mb-2"
							>
								Email for Updates (Optional)
							</label>
							<input
								id={emailId}
								type="email"
								value={giftData.notificationEmail}
								onChange={(e) =>
									setGiftData((prev) => ({
										...prev,
										notificationEmail: e.target.value,
									}))
								}
								placeholder="your@email.com"
								className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
							/>
							<div className="text-xs text-gray-500 mt-2 bg-orange-50 p-2 rounded-lg border border-orange-100">
								📧 This email will receive status notifications only.{" "}
								<strong>
									The secret redemption code will NOT be sent to this email
								</strong>
								. Only you will have access to the redemption code to share with
								your recipient.
							</div>
						</div>

						{/* Confirm Gift Button */}
						<div className="text-center pt-4">
							<button
								type="button"
								onClick={handleConfirmGift}
								disabled={isGeneratingAddress || giftData.sats === 0}
								className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg transition-all transform hover:scale-105 border border-orange-400 disabled:cursor-not-allowed"
							>
								{isGeneratingAddress ? (
									<span className="flex items-center gap-2">
										<div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
										Generating Address...
									</span>
								) : (
									"🎁 Confirm Gift"
								)}
							</button>
						</div>
					</div>
				)}

				{/* Step 3: Payment Address (shows after confirm gift) */}
				{currentStep === 3 && giftData.paymentAddress && (
					<div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl border-4 border-white/50">
						<StepHeader icon="₿" title="Send Bitcoin to Your Gift Address" />

						<div className="text-center py-8">
							<div className="bg-gradient-to-r from-orange-100 to-amber-100 p-6 rounded-2xl mb-6 border border-orange-200">
								<h3 className="text-xl font-bold text-gray-800 mb-4">
									Payment Details
								</h3>
								<div className="text-3xl font-black text-orange-800 mb-2">
									{giftData.sats} SATS
								</div>
								<div className="text-sm text-orange-600 mb-4">
									{giftData.sats / SATS_PER_BTC} BTC
								</div>
								{giftData.title && (
									<div className="text-lg font-semibold text-gray-700">
										{giftData.emoji} {giftData.title}
									</div>
								)}
							</div>

							{/* Payment Address */}
							<div className="bg-gray-50 rounded-2xl p-6 mb-6">
								<h4 className="text-lg font-bold text-gray-800 mb-4">
									💳 Send Bitcoin to this address:
								</h4>
								<div className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4">
									<div className="font-mono text-sm break-all text-gray-800">
										{giftData.paymentAddress}
									</div>
								</div>
								<button
									type="button"
									onClick={() => {
										giftData.paymentAddress &&
											copyAddressMutation.mutate(giftData.paymentAddress);
									}}
									className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors font-medium"
								>
									{copyAddressMutation.isSuccess
										? "✅ Copied!"
										: "📋 Copy Address"}
								</button>

								{/* QR Code Placeholder */}
								<h4 className="text-lg font-bold text-gray-800 mt-4 mb-2">
									Scan Bitcoin Address QR Code:
								</h4>
								<div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center mx-auto">
									<div className="text-center">
										<div className="text-4xl mb-2">📱</div>
										<div className="text-xs text-gray-500">
											QR Code
											<br />
											Coming Soon
										</div>
									</div>
								</div>
							</div>

							{/* Payment Status */}
							{isAwaitingPayment && (
								<div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
									<div className="flex items-center justify-center gap-3 mb-4">
										<div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
										<span className="text-lg font-semibold text-blue-800">
											Awaiting Payment
										</span>
									</div>
									<p className="text-blue-700 text-sm">
										Monitoring the blockchain for your payment to <br />
										<span className="font-mono text-xs">
											{giftData.paymentAddress}
										</span>
									</p>
									<p className="text-blue-600 text-xs mt-2">
										This usually takes 1-10 minutes depending on network
										congestion
									</p>
								</div>
							)}

							{/* Instructions */}
							<div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mt-6">
								<h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
									💡 How to Send Bitcoin
								</h4>
								<ul className="text-sm text-yellow-700 space-y-1 text-left">
									<li>• Copy the address above or scan the QR code</li>
									<li>
										• Open your Bitcoin wallet (hardware, mobile, or desktop)
									</li>
									<li>
										• Send{" "}
										<strong>
											exactly {giftData.sats} SATS
										</strong>{" "}
										to the address
									</li>
									<li>
										• Wait for confirmation (we'll detect it automatically)
									</li>
									<li>
										• Your gift will be ready to share once payment is confirmed
									</li>
								</ul>
							</div>
						</div>
					</div>
				)}

				{/* Step 4: Gift Receipt (shows after payment) */}
				{currentStep >= 4 && (
					<div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-green-200">
						<div className="text-center mb-6">
							<div className="text-6xl mb-4">🎉</div>
							<h2 className="text-3xl font-bold text-green-600 mb-2">
								Gift Created Successfully!
							</h2>
							<p className="text-gray-600">
								Share any of these with your recipient
							</p>
						</div>

						<RedemptionItem
							title="Redemption Code"
							icon="🔐"
							value={giftReceipt.redemptionCode}
							isRevealed={revealedCode}
							onToggleReveal={() => setRevealedCode(!revealedCode)}
							onCopy={() => copyCodeMutation.mutate(giftReceipt.redemptionCode)}
							isCopied={copyCodeMutation.isSuccess}
						/>

						<RedemptionItem
							title="Redemption Link"
							icon="🔗"
							value={giftReceipt.redemptionUrl}
							isRevealed={revealedUrl}
							onToggleReveal={() => setRevealedUrl(!revealedUrl)}
							onCopy={() => copyUrlMutation.mutate(giftReceipt.redemptionUrl)}
							isCopied={copyUrlMutation.isSuccess}
							className="text-xs break-all"
						/>

						<QRCodeSection
							onDownload={() => {
								// Mock download - in real app would generate and download actual QR code PNG
								alert("QR Code download coming soon!");
							}}
						/>

						{/* Important Info */}
						<div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
							<h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
								⚠️ Important Information
							</h3>
							<ul className="text-sm text-yellow-700 space-y-1">
								<li>
									• Gift expires on {giftReceipt.expiresAt.toLocaleDateString()}
								</li>
								<li>
									• Only the person with the code OR your wallet can redeem this
									gift
								</li>
								<li>
									• Keep the redemption code safe - anyone with it can claim the
									gift
								</li>
								<li>
									• You can cancel and recover funds if unused before expiration
								</li>
							</ul>
						</div>

						<div className="text-center mt-6">
							<button
								type="button"
								onClick={() => {
									// Reset for new gift
									setCurrentStep(1);
									setGiftData({
										sats: 0,
										title: "",
										message: "",
										occasionType: "custom",
										emoji: "🎁",
										notificationEmail: "",
									});
									setRevealedCode(false);
									setRevealedUrl(false);
									setIsGeneratingAddress(false);
									setIsAwaitingPayment(false);
									setPaymentConfirmed(false);
								}}
								className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-6 rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 border border-purple-400"
							>
								⚡ Create Another Bitcoin Gift
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
