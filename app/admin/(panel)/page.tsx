import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [projects, published, education, awards, experience, research, settings] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.cvEducation.count(),
    prisma.cvAward.count(),
    prisma.cvExperience.count(),
    prisma.cvResearchInterest.count(),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  const cvEntries = education + research + awards + experience;
  const name = settings?.name || "Portfolio";

  const cards = [
    {
      href: "/admin/about",
      kicker: "Biography",
      title: "About",
      text: "Edit the biography and theory labels.",
      stat: null,
      accent: "pink",
    },
    {
      href: "/admin/cv",
      kicker: "Curriculum",
      title: "CV",
      text: `${education} education, ${research} research, ${awards} awards, ${experience} roles.`,
      stat: String(cvEntries),
      accent: "orange",
    },
    {
      href: "/admin/projects",
      kicker: "Work volume",
      title: "Projects",
      text: `${published} published, ${projects - published} draft.`,
      stat: String(projects),
      accent: "green",
    },
    {
      href: "/admin/footer",
      kicker: "Contact",
      title: "Footer",
      text: "Name, email, links, and downloads.",
      stat: null,
      accent: "pink",
    },
    {
      href: "/admin/site",
      kicker: "Identity",
      title: "Site",
      text: "Name, tagline, and accent colors.",
      stat: null,
      accent: "orange",
    },
  ];

  return (
    <div className="dash">
      <header className="dash-head">
        <p className="dash-kicker">{name}</p>
        <h1 className="admin-title">Dashboard</h1>
        <p className="admin-lead">Choose a section to edit. Changes show on the portfolio after you save.</p>
      </header>

      <div className="dash-stats">
        <div>
          <strong>{projects}</strong>
          <span>Projects</span>
        </div>
        <div>
          <strong>{published}</strong>
          <span>Published</span>
        </div>
        <div>
          <strong>{cvEntries}</strong>
          <span>CV entries</span>
        </div>
        <div>
          <strong>{awards}</strong>
          <span>Awards</span>
        </div>
      </div>

      <div className="dash-grid">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className={`dash-card dash-card-${card.accent}`}>
            <span className="dash-card-top">
              <span className="dash-card-kicker">{card.kicker}</span>
              {card.stat ? <span className="dash-card-stat">{card.stat}</span> : null}
            </span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
            <span className="dash-card-go">Open</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
