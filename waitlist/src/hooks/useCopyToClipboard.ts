import { useMutation } from "@tanstack/react-query";

export function useCopyToClipboard() {
	return useMutation({
		mutationFn: async (text: string): Promise<void> => {
			// Try modern clipboard API first
			if (navigator.clipboard && window.isSecureContext) {
				try {
					await navigator.clipboard.writeText(text);
					return;
				} catch (error) {
					console.warn("Clipboard API failed, trying fallback:", error);
				}
			}

			// Fallback to execCommand for older browsers or insecure contexts
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			textArea.style.top = "-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			const successful = document.execCommand("copy");
			document.body.removeChild(textArea);

			if (!successful) {
				throw new Error("Copy operation failed");
			}
		},
		retry: false, // Don't retry copy operations
	});
}