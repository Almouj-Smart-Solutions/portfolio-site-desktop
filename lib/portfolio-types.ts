export type EducationEntry = {
  id: number;
  dateRange: string;
  degree: string;
  institution: string;
};

export type ResearchEntry = {
  id: number;
  title: string;
  description: string;
};

export type AwardEntry = {
  id: number;
  year: string;
  title: string;
  description: string;
};

export type ExperienceEntry = {
  id: number;
  dateRange: string;
  organization: string;
  location: string;
};

import type { ProjectLayout } from "@/lib/project-layout";

export type WorkProjectView = {
  slug: string;
  title: string;
  subtitle: string;
  year: number;
  projectType: string;
  architect: string;
  firm: string;
  position: string;
  projectFunction: string;
  awardFeature: string;
  size: string;
  location: string;
  status: string;
  client: string;
  teamLabel: string;
  team: string;
  specificRoles: string;
  timeline: string;
  summary: string;
  essay: string;
  tags: string[];
  layout: ProjectLayout;
  images: string[];
};

export type FooterLinkView = {
  id: number;
  label: string;
  url: string;
};

export type FooterDownloadView = {
  id: number;
  label: string;
  url: string;
  filename: string;
};

export type FooterView = {
  authorName: string;
  email: string;
  copyright: string;
  disciplineLeft: string;
  disciplineCenter: string;
  disciplineRight: string;
  links: FooterLinkView[];
  downloads: FooterDownloadView[];
};

export type SiteView = {
  name: string;
  tagline: string;
  accentPink: string;
  accentOrange: string;
  accentGreen: string;
};

export type PortfolioContent = {
  aboutHtml: string;
  education: EducationEntry[];
  research: ResearchEntry[];
  awards: AwardEntry[];
  experience: ExperienceEntry[];
  projects: WorkProjectView[];
  footer: FooterView;
  site: SiteView;
};
