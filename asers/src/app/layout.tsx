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
	title: {
		default: "ASERS | American Science and Engineering Research Symposium",
		template: "%s | ASERS",
	},
	description:
		"A national network of student-run science research competitions where high school students share, defend, and advance their original STEM research.",
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
			</body>
		</html>
	);
}
