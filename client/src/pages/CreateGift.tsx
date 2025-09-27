import { useState, useId } from "react";
import { Link } from "@tanstack/react-router";

interface GiftData {
  amount: {
    usd: number;
    btc: number;
    sats: number;
  };
  title: string;
  message: string;
  occasionType: 'birthday' | 'holiday' | 'thank-you' | "love" | 'congratulations' | 'custom';
  emoji: string;
  notificationEmail: string;
}

const PRESET_BTC_AMOUNTS = [0.0001, 0.0005, 0.001, 0.0025, 0.005]; // ~$10, $50, $100, $250, $500 at $100k BTC

const OCCASIONS: Pick<GiftData, 'occasionType' | 'title' | 'emoji' | 'message'>[] = [
  { 
    occasionType: "birthday", 
    title: "Happy Birthday!",
    message: "Hope you have an amazing day filled with joy and surprises! 🎉🎂", 
    emoji: "🎂" 
  },
  {
    occasionType: "love",
    title: "Love You!",
    message: "You're the best! Sending you all my love. ❤️",
    emoji: "❤️"
  },
  { 
    occasionType: "holiday", 
    title: "Happy Holidays!",
    message: "Warm wishes for a joyful holiday!",
    emoji: "🎄" 
  },
  { 
    occasionType: "thank-you", 
    title: "Thank You!", 
    message: "Thanks a bunch! You're awesome! 🙏",
    emoji: "🙏" 
  },
  { 
    occasionType: "congratulations", 
    title: "Congratulations!", 
    message: "Congrats on your achievement! 🎉",
    emoji: "🎉" 
  },
  { 
    occasionType: "custom", 
    title: "Special Gift", 
    message: "A special gift just for you!",
    emoji: "✨" 
  },
];

const EMOJI_OPTIONS = ["🎁", "🎂", "🙏", "💎", "🚀", "🌙", "⚡", "❤️", "💝", "🔥", "💰", "🎉", "🎄", "🦄", "🌈", "✨", "💫"];

// Mock BTC price - in real app this would come from an API
const BTC_PRICE_USD = 100000; // $100k Bitcoin
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
  onAmountChange: (btc: number, sats: number) => void;
}

interface OccasionPickerProps {
  giftData: GiftData;
  onOccasionSelect: (occasion: Pick<GiftData, 'occasionType' | 'title' | 'emoji' | 'message'>) => void;
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              currentStep >= step 
                ? 'bg-white text-purple-600 shadow-lg' 
                : 'bg-white/30 text-white'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-8 h-1 mx-1 rounded-full transition-all ${
                currentStep > step ? 'bg-white' : 'bg-white/30'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AmountSelection({ giftData, onAmountChange }: AmountSelectionProps) {
  return (
    <div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl border-4 border-white/50">
      <StepHeader icon="💰" title="Choose Amount" />

      <div className="mb-6">
        <div className="block text-sm font-semibold text-gray-700 mb-3">Gift Amount (BTC)</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {PRESET_BTC_AMOUNTS.map((amount) => (
            <button
              type="button"
              key={amount}
              onClick={() => onAmountChange(amount, Math.round(amount * SATS_PER_BTC))}
              className={`p-3 rounded-xl font-bold transition-all border-2 ${
                Math.abs(giftData.amount.btc - amount) < 0.0001
                  ? 'bg-orange-500 text-white border-orange-600 shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-orange-100 hover:border-orange-300'
              }`}
            >
              {amount} BTC
            </button>
          ))}
          <input
            type="number"
            placeholder="Custom"
            value={giftData.amount.btc || ''}
            onChange={(e) => {
              const btc = Number(e.target.value);
              onAmountChange(btc, Math.round(btc * SATS_PER_BTC));
            }}
            className="p-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none font-semibold text-center"
            min="0.0001"
            max="0.01"
            step="0.0001"
          />
        </div>
        <div className="text-xs text-gray-500 text-center">
          Choose your gift amount in Bitcoin
        </div>
      </div>

      {giftData.amount.btc > 0 && (
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-2xl border-2 border-orange-200">
          <div className="text-center">
            <div className="text-3xl font-black text-orange-800">
              {giftData.amount.btc.toFixed(6)} BTC
            </div>
            <div className="text-sm text-orange-600 mt-1">
              {giftData.amount.sats.toLocaleString()} sats • ≈ ${giftData.amount.usd.toFixed(2)} USD
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
      <div className="block text-sm font-semibold text-gray-700 mb-3">Choose Occasion</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {OCCASIONS.map((preset) => (
          <button
            type="button"
            key={preset.occasionType}
            onClick={() => onOccasionSelect(preset)}
            className={`p-3 rounded-xl font-medium transition-all border-2 text-left ${
              giftData.occasionType === preset.occasionType
                ? 'bg-pink-500 text-white border-pink-600 shadow-lg'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-pink-100 hover:border-pink-300'
            }`}
          >
            {preset.emoji} {preset.title.replace('!', '')}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmojiPicker({ selectedEmoji, onEmojiSelect }: EmojiPickerProps) {
  return (
    <div className="mb-6">
      <div className="block text-sm font-semibold text-gray-700 mb-3">Gift Emoji</div>
      <div className="flex flex-wrap gap-2">
        {EMOJI_OPTIONS.map((emoji) => (
          <button
            type="button"
            key={emoji}
            onClick={() => onEmojiSelect(emoji)}
            className={`w-12 h-12 rounded-xl text-2xl transition-all border-2 ${
              selectedEmoji === emoji
                ? 'bg-yellow-400 border-yellow-500 shadow-lg scale-110'
                : 'bg-gray-100 border-gray-200 hover:bg-yellow-100 hover:border-yellow-300'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function RedemptionItem({ title, icon, value, isRevealed, onToggleReveal, onCopy, isCopied, className = "text-sm" }: RedemptionItemProps) {
  const maskString = (str: string, showLength: number = 8) => {
    return str.slice(0, showLength) + '•'.repeat(Math.max(0, str.length - showLength));
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
      <div className="block text-sm font-semibold text-gray-700 mb-2">
        {icon} {title}
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex-1 p-3 bg-white rounded-xl border-2 font-mono ${className} ${className.includes('break-all') ? '' : ''}`}>
          {isRevealed ? value : maskString(value, title.includes('Link') ? 30 : 8)}
        </div>
        <button
          type="button"
          onClick={onToggleReveal}
          className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {isRevealed ? '🙈' : '👁️'}
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          {isCopied ? '✅' : '📋'}
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
          <div className="text-xs text-gray-500 ml-2">QR Code<br />Preview</div>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors font-medium"
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
    amount: { usd: 0, btc: 0, sats: 0 },
    title: "",
    message: "",
    occasionType: "custom",
    emoji: "🎁",
    notificationEmail: "",
  });

  // Mock gift receipt data
  const [giftReceipt] = useState({
    redemptionCode: "GIFT-MOON-ROCKET-DIAMOND-HANDS-2024",
    redemptionUrl: "https://coin-gift.app/redeem/GIFT-MOON-ROCKET-DIAMOND-HANDS-2024",
    qrCodeUrl: "/api/qr/GIFT-MOON-ROCKET-DIAMOND-HANDS-2024",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  const [revealedCode, setRevealedCode] = useState(false);
  const [revealedUrl, setRevealedUrl] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const handleBtcAmountChange = (btc: number, sats?: number) => {
    const calculatedSats = sats || Math.round(btc * SATS_PER_BTC);
    const calculatedBtc = sats ? sats / SATS_PER_BTC : btc;
    const usd = calculatedBtc * BTC_PRICE_USD;
    setGiftData(prev => ({
      ...prev,
      amount: { usd, btc: calculatedBtc, sats: calculatedSats }
    }));
    if (calculatedBtc > 0 && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleCustomization = () => {
    if (giftData.occasionType && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePayment = () => {
    // Mock payment success
    setCurrentStep(4);
  };

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, item]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="mb-4">
            <Link to="/" className="inline-block text-white/80 hover:text-white transition-colors text-sm">
              ← Back to Home
            </Link>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            Create Crypto Gift 🎁
          </h1>
          <p className="text-lg text-white/90 font-medium">
            Send crypto gifts that anyone can claim! 🚀
          </p>
        </div>

        <ProgressSteps currentStep={currentStep} />

        <AmountSelection giftData={giftData} onAmountChange={handleBtcAmountChange} />

        {/* Step 2: Customization (shows when amount is selected) */}
        {currentStep >= 2 && (
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl border-4 border-white/50">
            <StepHeader icon="✨" title="Customize Your Gift" />

            <OccasionPicker 
              giftData={giftData} 
              onOccasionSelect={(preset) => {
                setGiftData(prev => ({ ...prev, ...preset }));
                handleCustomization();
              }} 
            />

            {/* Title */}
            <div className="mb-6">
              <label htmlFor={titleId} className="block text-sm font-semibold text-gray-700 mb-2">
                Gift Title
              </label>
              <input
                id={titleId}
                type="text"
                value={giftData.title}
                onChange={(e) => setGiftData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Happy Birthday!"
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:outline-none font-semibold"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">
                {giftData.title.length}/100 characters
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label htmlFor={messageId} className="block text-sm font-semibold text-gray-700 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                id={messageId}
                value={giftData.message}
                onChange={(e) => setGiftData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Happy birthday! Hope you enjoy your first crypto! 🎉"
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:outline-none resize-none"
                rows={3}
                maxLength={250}
              />
              <div className="text-xs text-gray-500 mt-1">
                {giftData.message.length}/250 characters
              </div>
            </div>



            <EmojiPicker 
              selectedEmoji={giftData.emoji} 
              onEmojiSelect={(emoji) => setGiftData(prev => ({ ...prev, emoji }))} 
            />

            {/* Email for Notifications */}
            <div className="mb-4">
              <label htmlFor={emailId} className="block text-sm font-semibold text-gray-700 mb-2">
                Email for Updates (Optional)
              </label>
              <input
                id={emailId}
                type="email"
                value={giftData.notificationEmail}
                onChange={(e) => setGiftData(prev => ({ ...prev, notificationEmail: e.target.value }))}
                placeholder="your@email.com"
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
              <div className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded-lg">
                📧 This email will receive status notifications only. <strong>The secret redemption code will NOT be sent to this email</strong>. 
                Only you will have access to the redemption code to share with your recipient.
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment (shows when customization is done) */}
        {currentStep >= 3 && (
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl border-4 border-white/50">
            <StepHeader icon="💳" title="Connect Wallet & Pay" />

            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-2xl mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Transaction Summary</h3>
                <div className="text-3xl font-black text-orange-800">
                  {giftData.amount.btc.toFixed(6)} BTC
                </div>
                <div className="text-sm text-orange-600">
                  {giftData.amount.sats.toLocaleString()} sats
                </div>
                <div className="text-lg text-gray-600">
                  ${giftData.amount.usd.toFixed(2)} USD
                </div>
                {giftData.title && (
                  <div className="text-lg font-semibold text-gray-700 mt-2">
                    {giftData.emoji} {giftData.title}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePayment}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg transition-all transform hover:scale-105"
              >
                🦊 Connect MetaMask & Pay
              </button>
              
              <div className="text-xs text-gray-500 mt-4">
                Wallet integration coming soon! This is a preview.
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Gift Receipt (shows after payment) */}
        {currentStep >= 4 && (
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-green-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">Gift Created Successfully!</h2>
              <p className="text-gray-600">Share any of these with your recipient</p>
            </div>

            <RedemptionItem 
              title="Redemption Code"
              icon="🔐"
              value={giftReceipt.redemptionCode}
              isRevealed={revealedCode}
              onToggleReveal={() => setRevealedCode(!revealedCode)}
              onCopy={() => copyToClipboard(giftReceipt.redemptionCode, 'code')}
              isCopied={copiedItems.has('code')}
            />

            <RedemptionItem 
              title="Redemption Link"
              icon="🔗"
              value={giftReceipt.redemptionUrl}
              isRevealed={revealedUrl}
              onToggleReveal={() => setRevealedUrl(!revealedUrl)}
              onCopy={() => copyToClipboard(giftReceipt.redemptionUrl, 'url')}
              isCopied={copiedItems.has('url')}
              className="text-xs break-all"
            />

            <QRCodeSection 
              onDownload={() => {
                // Mock download - in real app would generate and download actual QR code PNG
                alert('QR Code download coming soon!');
              }}
            />

            {/* Important Info */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
              <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                ⚠️ Important Information
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Gift expires on {giftReceipt.expiresAt.toLocaleDateString()}</li>
                <li>• Only the person with the code OR your wallet can redeem this gift</li>
                <li>• Keep the redemption code safe - anyone with it can claim the gift</li>
                <li>• You can cancel and recover funds if unused before expiration</li>
              </ul>
            </div>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  // Reset for new gift
                  setCurrentStep(1);
                  setGiftData({
                    amount: { usd: 0, btc: 0, sats: 0 },
                    title: "",
                    message: "",
                    occasionType: "custom",
                    emoji: "🎁",
                    notificationEmail: "",
                  });
                  setRevealedCode(false);
                  setRevealedUrl(false);
                  setCopiedItems(new Set());
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                🎁 Create Another Gift
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}