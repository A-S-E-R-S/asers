import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Condensed } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const ubuntu = Ubuntu({
	weight: ["300", "400", "500", "700"],
	variable: "--font-ubuntu",
	subsets: ["latin"],
});

const ubuntuCondensed = Ubuntu_Condensed({
	weight: "400",
	variable: "--font-ubuntu-condensed",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://asers.org"),
	applicationName: "ASERS",
	creator: "American Science and Engineering Research Symposium",
	keywords: [
		"student science competition",
		"high school research symposium",
		"science fair judging",
		"student research feedback",
		"STEM research competition",
	],
	title: {
		default: "ASERS | Student Research, Judged by Scientists",
		template: "%s | ASERS",
	},
	description:
		"ASERS is a student-led national network of research symposia where high school students present original work, receive structured scientist feedback, and improve their research.",
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		url: "https://asers.org",
		siteName: "ASERS",
		title: "ASERS | Student Research, Judged by Scientists",
		description:
			"A student-led research competition built around scientist feedback, fairer evaluation, and the chance to improve your work.",
		images: [
			{
				url: "/images/display/optimized/1.jpg",
				width: 4032,
				height: 3024,
				alt: "A student presenting research at an ASERS symposium",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "ASERS | Student Research, Judged by Scientists",
		description:
			"A student-led research competition built around scientist feedback, fairer evaluation, and the chance to improve your work.",
		images: ["/images/display/optimized/1.jpg"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/images/asers.png" type="image/png" sizes="549x455"></link>
			</head>
			<body className={`${ubuntu.variable} ${ubuntuCondensed.variable} antialiased`}>
				<Nav />
				<main className="min-h-screen">{children}</main>
				<Footer />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Organization",
							name: "American Science and Engineering Research Symposium",
							alternateName: "ASERS",
							url: "https://asers.org",
							logo: "https://asers.org/images/asers.png",
							email: "contact@asers.org",
							description:
								"A student-led national network of high school research symposia.",
							sameAs: [],
						}),
					}}
				/>
			</body>
		</html>
	);
}
