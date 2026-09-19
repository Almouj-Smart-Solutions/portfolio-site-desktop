import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { workProjects } from "@/lib/data";
import DesktopManager from "@/components/desktop/DesktopManager";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return workProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = workProjects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = workProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  return <DesktopManager initialOpenWindow="work" initialSlug={slug} />;
}