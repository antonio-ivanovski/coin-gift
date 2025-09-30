import type { ReactNode } from "react";

interface FeatureCardProps {
	icon: string;
	title: string;
	description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
	return (
		<div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
			<div className="text-4xl mb-4">{icon}</div>
			<h3 className="text-xl font-bold text-white mb-3">{title}</h3>
			<p className="text-white/80">{description}</p>
		</div>
	);
}

interface StepCardProps {
	stepNumber: number;
	title: string;
	description: string;
	gradientFrom: string;
	gradientTo: string;
}

export function StepCard({
	stepNumber,
	title,
	description,
	gradientFrom,
	gradientTo,
}: StepCardProps) {
	return (
		<div className="text-center">
			<div
				className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white mx-auto mb-4`}
			>
				{stepNumber}
			</div>
			<h3 className="text-xl font-bold text-white mb-3">{title}</h3>
			<p className="text-white/80">{description}</p>
		</div>
	);
}

interface GradientButtonProps {
	children: ReactNode;
	onClick?: () => void;
	className?: string;
	gradientFrom?: string;
	gradientTo?: string;
	hoverFrom?: string;
	hoverTo?: string;
}

export function GradientButton({
	children,
	onClick,
	className = "",
	gradientFrom = "from-green-400",
	gradientTo = "to-blue-500",
	hoverFrom = "hover:from-green-500",
	hoverTo = "hover:to-blue-600",
}: GradientButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} ${hoverFrom} ${hoverTo} text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-2xl transition-all transform hover:scale-105 ${className}`}
		>
			{children}
		</button>
	);
}

interface GlassCardProps {
	children: ReactNode;
	className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
	return (
		<div
			className={`bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 ${className}`}
		>
			{children}
		</div>
	);
}
