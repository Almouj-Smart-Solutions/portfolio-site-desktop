import type { Metadata } from "next";
import DesktopManager from "@/components/desktop/DesktopManager";

export const metadata: Metadata = {
  title: "Payman Tahghighi - Architect, Researcher, Artist",
  description: "Portfolio of Seyed Javad (Payman) Tahghighi Jahromi — Iranian architect, trans-scalar researcher, and theoretical practitioner.",
};

export default function HomePage() {
  return <DesktopManager />;
}