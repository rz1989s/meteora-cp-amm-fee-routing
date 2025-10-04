import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Meteora DAMM V2 Fee Routing | Superteam Bounty Submission",
  description: "Professional submission for the Meteora DAMM V2 (CP-AMM) Fee Routing Program bounty. Permissionless fee distribution program for Solana.",
  keywords: "Solana, Meteora, DAMM V2, CP-AMM, Fee Routing, Anchor, Smart Contract, Superteam",
  authors: [{ name: "RECTOR" }],
  openGraph: {
    title: "Meteora DAMM V2 Fee Routing Program",
    description: "Permissionless fee routing program for Meteora DAMM V2 (CP-AMM) pools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
