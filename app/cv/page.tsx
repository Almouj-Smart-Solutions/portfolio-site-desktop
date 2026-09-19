import type { Metadata } from "next";
import DesktopManager from "@/components/desktop/DesktopManager";

export const metadata: Metadata = {
  title: "CV",
  description: "Curriculum Vitae of Seyed Javad (Payman) Tahghighi Jahromi — architect, researcher, and artist.",
};

export default function CVPage() {
  return <DesktopManager initialOpenWindow="cv" />;
}