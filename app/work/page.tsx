import type { Metadata } from "next";
import DesktopManager from "@/components/desktop/DesktopManager";

export const metadata: Metadata = {
  title: "Work Volume",
  description: "Architecture and research projects by Payman Tahghighi — a 50+ project portfolio spanning design, urbanism, and trans-scalar research.",
};

export default function WorkPage() {
  return <DesktopManager initialOpenWindow="work" />;
}