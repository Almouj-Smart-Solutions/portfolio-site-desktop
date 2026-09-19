import type { Metadata } from "next";
import DesktopManager from "@/components/desktop/DesktopManager";

export const metadata: Metadata = {
  title: "About",
  description: "Iranian architect, trans-scalar researcher, and theoretical practitioner — Seyed Javad (Payman) Tahghighi Jahromi.",
};

export default function AboutPage() {
  return <DesktopManager initialOpenWindow="about" />;
}