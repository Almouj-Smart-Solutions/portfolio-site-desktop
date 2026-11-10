import type { Metadata } from "next";
import DesktopManager from "@/components/desktop/DesktopManager";
import { getPortfolioContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CV",
  description: "Curriculum Vitae of Seyed Javad (Payman) Tahghighi Jahromi — architect, researcher, and artist.",
};

export default async function CVPage() {
  const content = await getPortfolioContent();
  return <DesktopManager content={content} initialOpenWindow="cv" />;
}
