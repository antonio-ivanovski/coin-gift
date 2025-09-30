import { createFileRoute } from "@tanstack/react-router";
import { CreateGiftPage } from "../pages/CreateGift";

export const Route = createFileRoute("/create-gift")({
	component: CreateGiftPage,
});
