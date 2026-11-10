import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DesktopManager from "@/components/desktop/DesktopManager";
import { getPortfolioContent } from "@/lib/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPortfolioContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const content = await getPortfolioContent();
  if (!content.projects.some((item) => item.slug === slug)) notFound();

  return <DesktopManager content={content} initialOpenWindow="work" initialSlug={slug} />;
}
