import type { Metadata } from "next";
import DesktopManager from "@/components/desktop/DesktopManager";
import { getPortfolioContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payman Tahghighi - Architect, Researcher, Artist",
  description: "Portfolio of Seyed Javad (Payman) Tahghighi Jahromi — Iranian architect, trans-scalar researcher, and theoretical practitioner.",
};

export default async function HomePage() {
  const content = await getPortfolioContent();
  return <DesktopManager content={content} />;
}
