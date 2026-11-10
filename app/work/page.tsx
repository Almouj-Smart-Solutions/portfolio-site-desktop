import type { Metadata } from "next";
import DesktopManager from "@/components/desktop/DesktopManager";
import { getPortfolioContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Work Volume",
  description: "Architecture and research projects by Payman Tahghighi — a 50+ project portfolio spanning design, urbanism, and trans-scalar research.",
};

export default async function WorkPage() {
  const content = await getPortfolioContent();
  return <DesktopManager content={content} initialOpenWindow="work" />;
}
