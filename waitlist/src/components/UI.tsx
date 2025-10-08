import { clsx } from "clsx";
import type { ReactNode } from "react";

interface GlassCardProps {
	children: ReactNode;
	className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
	return (
		<div
			className={clsx(
				"bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20",
				className,
			)}
		>
			{children}
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
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
}

export function GradientButton({
	children,
	onClick,
	className,
	gradientFrom = "from-purple-500",
	gradientTo = "to-blue-500",
	hoverFrom = "hover:from-purple-600",
	hoverTo = "hover:to-blue-600",
	disabled = false,
	type = "button",
}: GradientButtonProps) {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				"cursor-pointer bg-gradient-to-r text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-2xl transition-all transform hover:scale-105",
				gradientFrom,
				gradientTo,
				hoverFrom,
				hoverTo,
				"disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none",
				className,
			)}
		>
			{children}
		</button>
	);
}
