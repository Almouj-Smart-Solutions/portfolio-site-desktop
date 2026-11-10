import { PrismaClient } from "@prisma/client";
import { workProjects, aboutContent, siteSettings } from "../lib/data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with existing content...");

  // ── Site Settings ───────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: siteSettings.name,
      tagline: siteSettings.tagline,
      accentPink: siteSettings.accentColors.pink,
      accentOrange: siteSettings.accentColors.orange,
      accentGreen: siteSettings.accentColors.green,
    },
  });
  console.log("  ✓ Site settings");

  // ── About Content ───────────────────────────────────────────────────────
  // Build bio HTML from the existing richly-styled AboutWindow JSX
  const bioHtml = `<p>Seyed Javad (aka Payman) Tahghighi Jahromi is an Iranian artist, trans-scalar researcher, registered architect, and theoretical practitioner looking into architecture, urbanism, and their entangled relationships with technology through a multi-sensory lens.</p>

<p>The ideas contained within his works are grouped into three theories under the rubrics of <span style="color:#F43454;font-weight:600">OBJECTS &amp; BODIES</span>, <span style="color:#FB7A04;font-weight:600">LAYERS &amp; CITYSCAPES</span>, and <span style="color:#83E01B;font-weight:600">SYSTEMS &amp; TECHNOLOGIES</span>, encompassed diverse—and seemingly disparate—spheres of discourse ranging from <em>Cosmism</em> to <em>Philosophy of Science</em>, <em>[Persian] Mythology</em> to <em>Underlying Semiotics</em>, <em>Artivism</em> to <em>Proxemics</em>, and <em>Historiology</em> to <em>Urban Heterology</em>, exploring the spectrum of collective unconsciousness to spiritual consciousness with a relationship between physical world, mind, and technology as the primary undertone in order to reference the interplay between energy and matter, space and form.</p>

<p>To specifically prove the complexity of human perceptions' relationship with surrounding technical reality beyond its concrete manifestation, he narrowed his research into cognitive processes acquainted with his spatialized language. This probes into developing a theoretical language associated with design methodology in which architecture as a re-directed discipline objectifies its <em style="color:#FB7A04">ordinary built elements</em> (column, wall, roof, window, stairs, frames, etc.) and <em style="color:#FB7A04">materiality</em> and capturing them into space-organizer or space-maker components bearing psychoanalytic references and/or technophilic ideas. For instance, the monument he created (2020) and later published in Archello Online Platform (2026) and achieved Honorable Mention Award in 2A Continental Architectural Awards (2024), makes use of conventional concrete walls which separate totally two different cognitive worlds by establishing inter-consciousness and intra-consciousness of architecture to raise a solid form to an art form, heightening the subject's sensuous receptivity of both space and place connotations to the more-than-human sphere at the same time. his recent exploration in this regard was delving further into multi-sensory architecture by investigating how <em style="color:#FB7A04">Smellscapes</em> and <em style="color:#FB7A04">Soundscapes</em> would be able to form an implied spatial configuration in which the proposed architectural discipline could be sculpted into subjectified objects, demonstrating how sensescapes function as a mirror of our own individual or collective awareness and participation, of our being in the physical world.</p>

<p>While his achievements in smellscapes was lectured and published internationally, his latest step probes into soundscapes' synthesis with cityscapes through <em style="color:#FB7A04">mythology</em> <span style="color:#F43454">[objects]</span>, <em style="color:#FB7A04">urban heterology</em> <span style="color:#FB7A04">[layers]</span>, and <em style="color:#FB7A04">technology</em> <span style="color:#83E01B">[systems]</span>, resonating in how ancient knowledge of stereotomy could shape an architecture, and accordingly, autonomous cities, technologically and typologically. By tracing the paths of the magical sound transmission system in 14th-century Safavid arches, his forthcoming research, <em>Myth, Math, Mouth: Palimpsest Architecture</em>, will decipher the math behind its joineries to shed further light on how leveraging this ancient knowledge of stereotomy in MURBs' open spaces and public spaces' piloti can have an impact on the way we practice design and construction.</p>

<p>Out of research agenda, with a demonstrated history of 50+ professional architecture + planning portfolio nationwide, prior to initiating his own practice <u>SpaceScapeStudio (SSS)</u>, as an architect and construction manager at <u>Azhdari Associates</u>, a head architect and team leader at <u>AA-Studio</u>, he also worked alongside Mohammad Varasteh at his architectural firm, <u>VARTA and partners office</u>, on garnering more accolades, such as 2nd place (Silver Medal) in 8th cycle of Iranian Interior Architecture Award (2020), 3rd place (Bronze Medal) in 14th cycle of <u>Grand Memar Award</u> in public category (2019), and 3rd place (Bronze Medal) in 16th cycle of <u>Grand Memar Award</u> in single-story buildings category (2022) which is the most prestigious architectural award in Iran. This project is recently nominated for the Iran Building of the Year Award (2023).</p>

<p>His design work volume has been featured on various online platforms such as <u>Archello</u>, <u>Archinect</u>, <u>Architizer</u>, <u>Contemporary Architecture of Shiraz</u>, <u>2A Architecture and Art Magazine</u>, and <u>Vakawi</u>.</p>`;

  await prisma.aboutContent.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, bioHtml },
  });
  console.log("  ✓ About content");

  // ── About Theories ──────────────────────────────────────────────────────
  const existingTheories = await prisma.aboutTheory.count();
  if (existingTheories === 0) {
    await prisma.aboutTheory.createMany({
      data: aboutContent.theories.map((t, i) => ({
        label: t.label,
        color: t.color,
        position: i,
      })),
    });
  }
  console.log("  ✓ About theories");

  // ── CV — Education ──────────────────────────────────────────────────────
  const existingEdu = await prisma.cvEducation.count();
  if (existingEdu === 0) {
    await prisma.cvEducation.createMany({
      data: [
        { dateRange: "2018-2021", degree: "Master of Architecture (MArch)", institution: "Shahid Beheshti University, Tehran, Iran", position: 0 },
        { dateRange: "2013-2018", degree: "Bachelor of Architecture (BArch)", institution: "Islamic Azad University, Shiraz, Iran", position: 1 },
        { dateRange: "2009-2013", degree: "Diploma in Mathematics and Physics Discipline (with distinction)", institution: "Forough Andisheh 1 High School", position: 2 },
      ],
    });
  }
  console.log("  ✓ CV Education");

  // ── CV — Research Interests ─────────────────────────────────────────────
  const existingResearch = await prisma.cvResearchInterest.count();
  if (existingResearch === 0) {
    await prisma.cvResearchInterest.createMany({
      data: [
        { title: "OBJECTS and BODIES", description: "intersection of architecture and philosophy", position: 0 },
        { title: "LAYERS and CITYSCAPES", description: "intersection of architecture and urbanism", position: 1 },
        { title: "SYSTEMS and TECHNOLOGIES", description: "intersection of architecture and technology", position: 2 },
      ],
    });
  }
  console.log("  ✓ CV Research Interests");

  // ── CV — Awards ─────────────────────────────────────────────────────────
  const existingAwards = await prisma.cvAward.count();
  if (existingAwards === 0) {
    await prisma.cvAward.createMany({
      data: [
        { year: "2026", title: "Achieved Longlisted Mention (top 20)", description: "in 6th round of Kooche Magazine Award, Tehran, Iran", position: 0 },
        { year: "2024", title: "Achieved Honorable Mention Award", description: "in 2A Continental Architectural Awards (2ACAA) 2024 in medium-scale architecture category, Dubai, UAE", position: 1 },
        { year: "2021-2023", title: "Achieved Fellowship in Iran's Ministry of Interior", description: "Awarded the specified job title \"Civil Affairs' Development and Urban and Regional Planning Expert\" considered directly under \"Fars Governance Office\" in the form of \"Alternative Civilian Service (Amrieh)\" in lieu of the Compulsory Military Service which is the most competitive position given to 1% of national graduate students (2 or 3 quota for applicants per province) each year, Sarvestan, Iran", position: 2 },
        { year: "2023", title: "Ranked 3rd", description: "in 2023 Iran National House Award (single-story interior architecture category), collaborative work with VARTA office, Shiraz, Iran", position: 3 },
        { year: "2023", title: "Ranked 3rd", description: "in 2023 Archfestival (architecture and society) Award, collaborative work with VARTA office, Shiraz, Iran", position: 4 },
        { year: "2023", title: "Nominated", description: "for 2023 Iran Building of the Year Award, collaborative work with VARTA office, Shiraz, Iran", position: 5 },
        { year: "2022", title: "Ranked 3rd (Bronze Medal)", description: "in 2022 National Grand MEMAR Award, collaborative work with VARTA office, Shiraz, Iran", position: 6 },
        { year: "2021", title: "Ranked 2nd (Silver Medal)", description: "in 2021 Shiraz MEMAR Award, collaborative work with VARTA office, Shiraz, Iran", position: 7 },
        { year: "2020", title: "Ranked 2nd (Silver Medal)", description: "in 2020 Interior Architecture Award of HONAR-e-MEMARI (Magazine Award), collaborative work with VARTA office, Shiraz, Iran", position: 8 },
        { year: "2019", title: "Ranked 3rd (Bronze Medal)", description: "in 2019 National Grand MEMAR Award, collaborative work with VARTA office, Shiraz, Iran", position: 9 },
        { year: "2018", title: "Ranked 10th", description: "among more than 20,000 participants from all provinces of Iran in the Nationwide University Entrance Exam known as Konkoor in the field of Architectural Engineering, Tehran, Iran\nRanked 1st among 18 fellows of Master of Science in Architectural Engineering based on National Organization of Educational Testing (NOET) results in class of 2018-2021, Tehran, Iran", position: 10 },
        { year: "2018-2021", title: "Recipient of Full Ride Scholarship", description: "for studying Master of Science in Architectural Engineering at Shahid Beheshti University of Tehran from Iran's Ministry of Science, Research and Technology, Tehran, Iran", position: 11 },
        { year: "2018", title: "Ranked 18th", description: "among more than 20,000 participants from all provinces of Iran in the Nationwide University Entrance Exam known as Konkoor in the field of Landscape Architectural Engineering, Tehran, Iran", position: 12 },
        { year: "2018-2021", title: "Recipient of Full Ride Scholarship", description: "for studying Master of Science in Landscape Architectural Engineering at Shahid Beheshti University of Tehran from Iran's Ministry of Science, Research and Technology, Tehran, Iran", position: 13 },
        { year: "2018", title: "Ranked 21st", description: "among more than 20,000 participants from all provinces of Iran in the Nationwide University Entrance Exam known as Konkoor in the field of Interior Architecture, Tehran, Iran", position: 14 },
        { year: "2018-2021", title: "Recipient of Full Ride Scholarship", description: "for studying Master of Interior Architecture at Art University of Tehran from Iran's Ministry of Science, Research and Technology, Tehran, Iran", position: 15 },
        { year: "2018", title: "Ranked 35th", description: "among more than 20,000 participants from all provinces of Iran in the Nationwide University Entrance Exam known as Konkoor in the field of Master of Science in Iranian Architectural Studies, Tehran, Iran", position: 16 },
        { year: "2017", title: "Ranked 4th", description: "in the Province-level Sketching Competition, Shiraz, Iran", position: 17 },
        { year: "2016", title: "Ranked 3rd", description: "in the Province-level Sketching Competition, Shiraz, Iran", position: 18 },
        { year: "2010", title: "Ranked 3rd (Bronze Medal)", description: "in Asian Young Designers' Award, Cairo, Egypt", position: 19 },
      ],
    });
  }
  console.log("  ✓ CV Awards");

  // ── CV — Experience ─────────────────────────────────────────────────────
  const existingExp = await prisma.cvExperience.count();
  if (existingExp === 0) {
    await prisma.cvExperience.createMany({
      data: [
        { dateRange: "2023-now", organization: "SpaceScapeStudio", location: "Shiraz, Fars, Iran", position: 0 },
        { dateRange: "2021-2023", organization: "Fars Province Governor Office-Technical and Civil Affairs + Urban Planning Department-Sarvestan Branch", location: "Sarvestan, Fars, Iran", position: 1 },
        { dateRange: "2020-2021", organization: "VARTA and PARTNERS office", location: "Shiraz, Fars, Iran", position: 2 },
        { dateRange: "2020", organization: "AA-Studio", location: "Shiraz, Fars, Iran", position: 3 },
        { dateRange: "2014-2015", organization: "Azhdari Associates", location: "Shiraz, Fars, Iran", position: 4 },
      ],
    });
  }
  console.log("  ✓ CV Experience");

  // ── Work Projects ───────────────────────────────────────────────────────
  for (const [i, p] of workProjects.entries()) {
    const existing = await prisma.project.findUnique({ where: { slug: p.slug } });
    const data = {
      title: p.title,
      subtitle: p.subtitle ?? "",
      year: p.year,
      projectType: p.projectType ?? "",
      role: p.position ?? "",
      size: p.size ?? "",
      location: p.location ?? "",
      status: p.status ?? "",
      client: p.client ?? "",
      summary: p.summary ?? "",
      essay: p.essay ?? "",
      tags: JSON.stringify(p.tags ?? []),
      published: true,
      order: i,
    };
    const project = existing
      ? await prisma.project.update({ where: { id: existing.id }, data })
      : await prisma.project.create({ data: { slug: p.slug, ...data } });

    await prisma.projectImage.deleteMany({ where: { projectId: project.id } });
    if (p.images && p.images.length > 0) {
      await prisma.projectImage.createMany({
        data: p.images.map((url, idx) => ({
          url,
          projectId: project.id,
          order: idx,
        })),
      });
    }
  }
  console.log("  ✓ Work projects");

  // ── Footer ──────────────────────────────────────────────────────────────
  const existingFooter = await prisma.footerContent.count();
  if (existingFooter === 0) {
    await prisma.footerContent.create({
      data: {
        id: 1,
        authorName: "SEYED JAVAD (aka PAYMAN) TAHGHIGHI JAHROMI",
        email: "paymantahghighi@gmail.com",
        copyright: "© 2026 copyright by Seyed Javad Tahghighi Jahromi. all rights reserved.",
        disciplineLeft: "architecture x philosophy",
        disciplineCenter: "architecture x urbanism",
        disciplineRight: "architecture x technology",
        links: {
          create: [
            { label: "instagram", url: "https://instagram.com/paymantahghighi", order: 0 },
            { label: "linkedin", url: "https://linkedin.com/in/paymantahghighi", order: 1 },
          ],
        },
        downloads: {
          create: [
            { label: "abridged cv (1-page)", url: "/assets/cv/cv.pdf", filename: "Payman_Tahghighi_Abridged_CV.pdf", order: 0 },
            { label: "extended cv (9-pages)", url: "/assets/cv/cv.pdf", filename: "Payman_Tahghighi_Extended_CV.pdf", order: 1 },
            { label: "abridged portfolio (28-pages)", url: "", filename: "", order: 2 },
            { label: "extended portfolio (36-pages)", url: "", filename: "", order: 3 },
          ],
        },
      },
    });
  }
  console.log("  ✓ Footer content");

  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
