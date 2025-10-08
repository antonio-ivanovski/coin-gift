import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		// Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
	],
	server: {
		port: 5174, // Different port from main client to avoid conflicts
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
	preview: {
		port: 4174, // Different preview port too
	},
});
