import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import "@/styles/globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fira",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Payman Tahghighi — Architect, Researcher, Artist",
    template: "%s | Payman Tahghighi",
  },
  description: "Portfolio of Seyed Javad (Payman) Tahghighi Jahromi — Iranian architect, trans-scalar researcher, and theoretical practitioner.",
  keywords: ["architecture", "research", "urbanism", "Iran", "portfolio"],
  authors: [{ name: "Payman Tahghighi" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={firaSans.variable}>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}