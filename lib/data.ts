// Static content data — will be replaced by Sanity CMS later

export const siteSettings = {
  name: "Payman Tahghighi",
  tagline: "Architect · Researcher · Artist",
  accentColors: { pink: "#F43454", orange: "#FB7A04", green: "#83E01B" },
};

export const aboutContent = {
  theories: [
    { label: "OBJECTS & BODIES",      color: "pink"   },
    { label: "LAYERS & CITYSCAPES",   color: "orange" },
    { label: "SYSTEMS & TECHNOLOGIES",color: "green"  },
  ],
  fullBio: `Seyed Javad (aka Payman) Tahghighi Jahromi is an Iranian artist, trans-scalar researcher, registered architect, and theoretical practitioner looking into architecture, urbanism, and their entangled relationships with technology through a multi-sensory lens.

The ideas contained within his works are grouped into three theories under the rubrics of OBJECTS & BODIES, LAYERS & CITYSCAPES, and SYSTEMS & TECHNOLOGIES, encompassed diverse spheres of discourse ranging from Cosmism to Philosophy of Science, Persian Mythology to Underlying Semiotics, Artivism to Proxemics, and Historiology to Urban Heterology, exploring the spectrum of collective unconsciousness to spiritual consciousness.

To specifically prove the complexity of human perceptions relationship with surrounding technical reality beyond its concrete manifestation, he narrowed his research into cognitive processes acquainted with his spatialized language. This probes into developing a theoretical language associated with design methodology in which architecture as a re-directed discipline objectifies its ordinary built elements and capturing them into space-organizer or space-maker components bearing psychoanalytic references and technophilic ideas.

Out of research agenda, with a demonstrated history of 50+ professional architecture and planning portfolio nationwide, prior to initiating his own practice SpaceScapeStudio (SSS), as an architect and construction manager at Azhdari Associates, a head architect and team leader at AA-Studio, he also worked alongside Mohammad Varasteh at his architectural firm VARTA and partners office, garnering accolades including 2nd place (Silver Medal) in 8th cycle of Iranian Interior Architecture Award (2020), 3rd place (Bronze Medal) in 14th cycle of Grand Memar Award in public category (2019), and 3rd place (Bronze Medal) in 16th cycle of Grand Memar Award in single-story buildings category (2022).

His design work volume has been featured on various online platforms such as Archello, Archinect, Architizer, Contemporary Architecture of Shiraz, 2A Architecture and Art Magazine, and Vakawi.`,
};

function numberedImages(folder: string, count: number, start = 0) {
  return Array.from({ length: count }, (_, index) => {
    const number = String(start + index).padStart(2, "0");
    return `/assets/work/${folder}/${number}.jpg`;
  });
}

export const workProjects = [
  {
    slug: "among-community-between-communities",
    title: "Among Community, Between Communities",
    subtitle: "Architecture as a Form of Communication",
    year: 2023,
    projectType: "Professional (Government Tenure)",
    position: "Architectural Designer and Planner",
    size: "7,847 m2",
    location: "Maharlou, Fars, Iran",
    status: "Commissioned to Build",
    client: "School Renovation, Development, and Equipping Organization in collaboration with Fars Province Governor Office",
    summary: "This project harnesses the critical imagination to generate communities without boundaries through artivism, providing a more dignified and respectful co-learning environment.",
    essay: `This project harnesses the critical imagination to generate communities without boundaries through artivism, providing a more dignified and respectful co-learning environment.

Developed under government tenure with the School Renovation, Development, and Equipping Organization in collaboration with Fars Province Governor Office, it treats architecture as a form of communication — a spatial language through which communities can meet without the usual hard edges of enclosure.

The 7,847 m2 commission in Maharlou, Fars, Iran is designed as a co-learning campus whose built elements are meant to objectify ordinary school parts (wall, court, frame, stair) into space-makers, so that the institution can host more than one community at once.`,
    images: numberedImages("among-community", 23),
    imageCount: 23,
    tags: ["Artivism", "Education", "Community", "Proxemics"],
  },
  {
    slug: "at-the-threshold-of-not-being-and-being",
    title: "At the Threshold of Not-Being and Being",
    subtitle: "Planning as Guardian of Memory and Meaning",
    year: 2019,
    projectType: "Competition, Research-Based Design",
    position: "Architectural Designer and Planner",
    size: "238 m²",
    location: "Shiraz, Fars, Iran",
    status: "Not Realized",
    client: "Shiraz University, Iran’s Ministry of Science, Research, and Technology, and Iran’s Secretariat of Architectural and Urban Competitions",
    summary:
      "This research-based design explores the relationship between internal and external references of a construction in order to raise a solid form to an art form, utilizing the inter-consciousness and inner-consciousness of architecture.",
    essay: `This research-based university gateway for Shiraz University explores the relationship between internal and external references of a construction in order to raise a solid form to an art form.

The design consists of vertical slabs that read as columns from the front and as surfaces between the city and the university. Place and space open between the slabs so visitors cannot settle on a single reference, producing an architecture of both depth and width along the Eram green axis.

Design: 2019. Research and publication: 2022–2024. Honorable Mention, 2A Continental Architectural Awards (2ACAA) 2024.`,
    images: numberedImages("at-the-threshold-of-not-being-and-being", 33),
    imageCount: 33,
    tags: ["Competition", "Research", "Urbanism", "Gateway"],
  },
];