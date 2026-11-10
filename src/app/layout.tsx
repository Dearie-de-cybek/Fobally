import type { Metadata, Viewport } from "next";
import { Fraunces, Bricolage_Grotesque, DM_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz", "SOFT", "WONK"], style: ["normal", "italic"] });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "The People's Canvas — Paint Your Aspired Nigeria 2026",
  description: "A call to Nigerian artists and citizens to imagine, create and document the Nigeria they aspire to see between 2027 and 2031. Organised by Fobally Art Gallery.",
};
export const viewport: Viewport = { themeColor: "#2a2f5c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${bricolage.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
