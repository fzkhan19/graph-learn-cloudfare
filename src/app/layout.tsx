import Providers from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/navbar";
import { JSON_LD, METADATA } from "@/constants/Metadata";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter, Urbanist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-in",
});

const manrope = Urbanist({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-ur",
});

export const metadata: Metadata = METADATA;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn("", inter.variable, manrope.variable)}>
				<main className="no-scrollbar overflow-x-hidden overflow-y-scroll scroll-smooth font-in">
					<Analytics />
					<Script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
						dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
						type="application/ld+json"
					/>
					<Providers>
						<Navbar />
						{children}
					</Providers>
				</main>
			</body>
		</html>
	);
}
