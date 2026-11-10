import type { Metadata } from "next";
import DesktopManager from "@/components/desktop/DesktopManager";
import { getPortfolioContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "Iranian architect, trans-scalar researcher, and theoretical practitioner — Seyed Javad (Payman) Tahghighi Jahromi.",
};

export default async function AboutPage() {
  const content = await getPortfolioContent();
  return <DesktopManager content={content} initialOpenWindow="about" />;
}
