import { unstable_cache } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { prisma } from "@/lib/db";
import { parseProjectLayout } from "@/lib/project-layout";
import type { FooterView, PortfolioContent, SiteView, WorkProjectView } from "@/lib/portfolio-types";

const fallbackSite: SiteView = {
  name: "Payman Tahghighi",
  tagline: "Architect · Researcher · Artist",
  accentPink: "#F43454",
  accentOrange: "#FB7A04",
  accentGreen: "#83E01B",
};

const fallbackFooter: FooterView = {
  authorName: "SEYED JAVAD (aka PAYMAN) TAHGHIGHI JAHROMI",
  email: "paymantahghighi@gmail.com",
  copyright: "© 2026 copyright by Seyed Javad Tahghighi Jahromi. all rights reserved.",
  disciplineLeft: "architecture x philosophy",
  disciplineCenter: "architecture x urbanism",
  disciplineRight: "architecture x technology",
  links: [],
  downloads: [],
};

function parseTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((tag): tag is string => typeof tag === "string");
  } catch {
    return [];
  }
}

export function accentColor(value: string | null | undefined, fallback: string) {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

async function loadPortfolioContent(): Promise<PortfolioContent> {
  const [about, education, research, awards, experience, projects, footer, site] = await Promise.all([
    prisma.aboutContent.findUnique({ where: { id: 1 } }),
    prisma.cvEducation.findMany({ orderBy: { position: "asc" } }),
    prisma.cvResearchInterest.findMany({ orderBy: { position: "asc" } }),
    prisma.cvAward.findMany({ orderBy: { position: "asc" } }),
    prisma.cvExperience.findMany({ orderBy: { position: "asc" } }),
    prisma.project.findMany({
      where: { published: true },
      include: { images: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    }),
    prisma.footerContent.findUnique({
      where: { id: 1 },
      include: {
        links: { orderBy: { order: "asc" } },
        downloads: { orderBy: { order: "asc" } },
      },
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  const projectViews: WorkProjectView[] = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle,
    year: project.year,
    projectType: project.projectType,
    architect: project.architect,
    firm: project.firm,
    position: project.role,
    projectFunction: project.projectFunction,
    awardFeature: project.awardFeature,
    size: project.size,
    location: project.location,
    status: project.status,
    client: project.client,
    teamLabel: project.teamLabel || "team:",
    team: project.team,
    specificRoles: project.specificRoles,
    timeline: project.timeline,
    summary: project.summary,
    essay: DOMPurify.sanitize(project.essay, {
      ADD_ATTR: ["style", "class", "target", "rel"],
    }),
    tags: parseTags(project.tags),
    layout: parseProjectLayout(project.layoutJson, {
      teamLabel: project.teamLabel,
    }),
    images: project.images.map((image) => image.url),
  }));

  return {
    aboutHtml: DOMPurify.sanitize(about?.bioHtml ?? "", {
      ADD_ATTR: ["style", "target", "rel"],
    }),
    education,
    research,
    awards,
    experience,
    projects: projectViews,
    footer: footer
      ? {
          authorName: footer.authorName,
          email: footer.email,
          copyright: footer.copyright,
          disciplineLeft: footer.disciplineLeft,
          disciplineCenter: footer.disciplineCenter,
          disciplineRight: footer.disciplineRight,
          links: footer.links.map((link) => ({ id: link.id, label: link.label, url: link.url })),
          downloads: footer.downloads.map((item) => ({
            id: item.id,
            label: item.label,
            url: item.url,
            filename: item.filename,
          })),
        }
      : fallbackFooter,
    site: site
      ? {
          name: site.name,
          tagline: site.tagline,
          accentPink: accentColor(site.accentPink, fallbackSite.accentPink),
          accentOrange: accentColor(site.accentOrange, fallbackSite.accentOrange),
          accentGreen: accentColor(site.accentGreen, fallbackSite.accentGreen),
        }
      : fallbackSite,
  };
}

const getCachedPortfolioContent = unstable_cache(loadPortfolioContent, ["portfolio-content"], {
  revalidate: 120,
  tags: ["portfolio"],
});

export async function getPortfolioContent(): Promise<PortfolioContent> {
  return getCachedPortfolioContent();
}

const getCachedSiteAccents = unstable_cache(
  async () => {
    const site = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    return {
      pink: accentColor(site?.accentPink, fallbackSite.accentPink),
      orange: accentColor(site?.accentOrange, fallbackSite.accentOrange),
      green: accentColor(site?.accentGreen, fallbackSite.accentGreen),
    };
  },
  ["site-accents"],
  { revalidate: 300, tags: ["site-accents"] },
);

export async function getSiteAccents() {
  try {
    return await getCachedSiteAccents();
  } catch {
    return {
      pink: fallbackSite.accentPink,
      orange: fallbackSite.accentOrange,
      green: fallbackSite.accentGreen,
    };
  }
}
