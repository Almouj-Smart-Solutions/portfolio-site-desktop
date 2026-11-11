// Static content data — seeded into SQLite / Prisma

export const siteSettings = {
  name: "Payman Tahghighi",
  tagline: "Architect · Researcher · Artist",
  accentColors: { pink: "#F43454", orange: "#FB7A04", green: "#83E01B" },
};

export const aboutContent = {
  theories: [
    { label: "OBJECTS & BODIES", color: "pink" },
    { label: "LAYERS & CITYSCAPES", color: "orange" },
    { label: "SYSTEMS & TECHNOLOGIES", color: "green" },
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

const thresholdAwardFeature = `The project is a research-based design accompanying two dossiers published at Landscape Architecture Frontiers (LAF) Journal and Arena Journal of Architectural Research (AJAR) and two conference papers presented at ICDUCONF and International Society of City and Regional Planners (ISOCARP).

Journal Paper (LAF):
Access to short version (1-page): doi:
Access to full version (20-pages): doi:

Journal Paper (AJAR):
Access to short version (1-page): doi:
Access to full version (20-pages): doi:

Conference Paper (ICDUCONF):
Access to short version (1-page): doi: https://civilica.com/doc/1629049/
Access to full version (8-pages): doi:

Congress Paper (ISOCARP):
Access to short version (1-page): doi: https://civilica.com/doc/1629049/
Access to full version (8-pages): doi:

The project achieved Honorable Mention Award in 2A Continental Architectural Awards (2ACAA) 2024.

The project is published in various online platforms, such as Archdaily, 2A Art and Architecture Magazine, contemporary architecture of shiraz, and vakawi.`;

function essayHeading(text: string) {
  return `<p class="essay-heading">${text}</p>`;
}

function essayBody(text: string) {
  return `<p class="essay-body">${text}</p>`;
}

const thresholdEssay = [
  `<p class="essay-heading">brief:</p>`,
  `<p class="essay-quote">“The design consists of numerous vertical slabs created from two major dimensions that are seen as “columns” from the front and are located at different levels of the “City” and the “University” in the form of “surfaces”. These two dimensions act as different references of the same construction, depending upon whether subject is leaving or approaching the monument. The slabs activate both dimensions by establishing place and space between themselves so that the visitor does not notice the exact reference of the object, making it difficult to determine whether the project is made of columns or surfaces. Consequently, its value is seen as being a partial strategy for an architecture of “depth”, whereas the other part is an architecture rooted in “width” as the main punctum of the urban frame. Surfaces with different levels in depth act as a social reference to the relationship between the city and the university that regardless of formal experiences lead visitors to a memorable experience due to sensory and psychological perceptions occuring by momentous single sequences in-between the surfaces. These multifaceted experiences are considered unique from person to person. The front façade, before having been read as a symbol for the university, act as a historical reference for the city and the green axis of Eram Blvd. embracing it; because before our determination of identity, it is existed in the presence of the Shiraz native landscape from Eram Blvd. to the heart of university, so that in bringing the meta-physical into the physical, the object begins to avoid concretizing anything that would cut the sky between the two.</p>`,
  `<p class="essay-quote">The implied space sitting between all slabs (from the city to the university) forces pedestrians to frame the university’s components of identity—dormitories and its central core on the top of university hill—as a catalyzing point of stasis. On the way back (from the university to the city) the same spatial consideration is retained, but the subject is confronted with a space in which the Sky and the Trees have reached eachother on both sides.”</p>`,
  essayBody(
    `This passage was our brief for the “Shiraz University Main Gateway Design” competition entry. The competition’s description was to design the gateway on a plot of 238 m2. Although its built area was small, it had camouflaged an infrastructure whose built impetus was deliberately rooted in the urban historiography of a sacred city.`,
  ),
  essayHeading(
    `Palimpsest in Urbanism:Evolution of the Genealogy of “Supreme Wisdom” in Khan School to the Ideology of “Transpatialization” in Shiraz University:`,
  ),
  essayBody(
    `By exploring archival manuscripts and newspapers, patterns, and treatise of Pahlavi University, we found traces of its starting point of speculations and conceptualizations through animism and semiotics, revealing to us three symbols constitutive of an identical gen considered by the project’s architect and founders. The analysis of what constitutes this imaginary nucleus itself led us to probe into an embedded relationship between politics, culture, and identity through mining myths of Achaemenian aspirations. As primitive ancestors of Persians, myth played an important political role in providing grounds for making institutions and functions in dynasties after them. Architecture and planning, here, as historical records, appear in the role of guardians of memory and meaning. As a story searching for its narrator, we consider ourselves as that of a hypothetical time traveler traversing this super-magical wonderland and import these arguments from a post-semiotic hermeneutics standpoint as catalysts to its content reading to unwrap a nation’s cultural kernel and to demythologize history. This is how the past will find contemporary pattern.`,
  ),
  essayHeading(
    `Mapping the History as a Utility for Unraveling the Story: Gradual Change of the Morphological Relationship between Social and Scientific Institutions in the Context of Intermontane Plain of Tirazziš (modern Iranian city of Shiraz) from Past to Present:`,
  ),
  essayBody(
    `As a technique to analyze the relationship between societal functions and educational institutions from past to present in this city, we used figure-ground theory. This diagram, helped us to visualize how general contours of terrain separates city from its contemporary educational-making institution (Shiraz university). This ideology which is considered as the concept of [university] establishment by [its] founders and architects, screams the cherish of landscape thinking in its most euphoric state and our approach here, as planners, became solving the problem of this gap between society and university through the gateway in-between.`,
  ),
  essayHeading(
    `MYTHICAL NUCLEUS: the common core of a nation’s functions, institutions, and infrastructures`,
  ),
  essayBody(
    `These institutions, instructions, and functions are superimposed on each other followed by a common kernel that houses an iconic archetype of nationalism—the Imperial Authority. It is in them that one can meaningfully observe the entanglement of Iranian political, social, cultural, and by extent belief and educational systems that digest the very first conceptualization of the creation of the Pahlavi University. Leveraging the mined mythical nucleus, this urbanism research which leads to an architecture design parallels two kinds of these functions: I. Historical and II. Societal, highlighting the synthesis of these two as the key insight of the educational-institution–making process of the Pahlavi (Shiraz) University:`,
  ),
  essayHeading(`I. Historical institutions and the production of Space:`),
  essayBody(
    `The Shiraz University Campus and its components of identity, which are embedded as the focal point of cultural activities at the highest point of the city, have served as a symbol of history during its 7 decades of foundation, both from their location and conceptualization. Its body is visible from almost every point of the city and bears resemblance to Pasargadae Lotus abstract notion. Utilizing Ricoeur’s “Ideology and Utopia”, this section aims to prove the pre-existing space created by this catalyzing point of stasis, manifesting political myth development of the Pahlavi Dynasty in a historical appearance. Throughout 3 stages of metamorphoses—Nationalization, Modernization, and Transpatialization—of Iran’s socio-spatial institutions, this concept remained intact, leading to an aristocracy of culture, a legacy which the city of Shiraz inherited.`,
  ),
  essayHeading(`II. Societal functions and the production of Space:`),
  essayBody(
    `The Eram Garden Complex, which is painted as a motif of the entire gardens of the intermontane plain of Shiraz within the metropolitan fabric, has shaped a social life inside and around itself. This social life triggers deeper constructing meaning by citizens socially, intensified by the adjoining “Eram” green pedestrian-centric axis. By adopting the socio-spatial perspective (SSP), this section takes Lefebvre’s trichotomy of social production of immaterial space into account to argue that the linear promenade which is spatially “perceived” for daily routines and activities by citizens transforms into a “conceived” space in which the ‘gateway’ is not only for academics and those who are related to it in any way but it provides a subjective experience of social space shaped by symbols and personal emotions of those who “lived” it from the cityscape.`,
  ),
  essayHeading(`Manipulation of Leftover Space:`),
  essayBody(
    `Our approach to this project was to practice “not to design”; therefore, instead of matter design, we struggled to prove the pre-existing spaces. These spaces were analyzed through two societal and historical institutions. By cross-referencing these two institutions against each other as the key insight of the production of Shiraz University, we unveiled an in-betweenness quality summoned in the form of an implied space at the gateway location which became subject to architectural manipulation.`,
  ),
  essayHeading(
    `[Societal Functions X Scientific Institutions]: City for University, University for City:`,
  ),
  essayBody(
    `Eventually, through backward reasoning, the slabs were embedded to re-direct the inter-consciousness and intra-consciousness of an architecture to raise a solid form into an art form. By implying the notions of "space" and "place" within and between themselves, these two in addition to meet the requirements of the gateway, also provide a set of mutual feelings for each person (citizen or academic) depending upon his encounter with the city or university. This multidimensional nature of individual experiences does not debilitate the two main references of the monument, within which both history is preserved for the city, and in turn, society for the university.`,
  ),
  essayHeading(`Embracing “Eram” green axis as an intrinsic element of Design:`),
  essayBody(
    `By forging an architecturally-mediated discourse between city and university, the strategy behind the regional planning of the gateway places particular importance on “Eram Blvd.”, making this urban corridor integral to design. As seen from above and front in plan and façade, it ultimately provides an architecture of the unseen where mass is missed for citizens who encounter it from cityscape.`,
  ),
  essayHeading(`Déjà vu: the Fragile Summons of History:`),
  essayBody(
    `Out of numerous possibilities along the site, the modeling of material in the form of parallel concrete slabs was our proposal in-between which the place is planned to be constituted. The psychological space which, therefore, stems out of this place connects trees and sky between Eram Blvd. (city) and University Blvd. (university), unifying the two into a “thing”. As the result, the monument is not just a functional object, but rather a dual signifier of referential object bearing symbolic meanings.`,
  ),
].join("\n");

export const workProjects = [
  {
    slug: "among-community-between-communities",
    title: "Among Community, Between Communities",
    subtitle: "Architecture as a Form of Communication",
    year: 2023,
    projectType: "Professional (Government Tenure)",
    architect: "",
    firm: "",
    position: "Architectural Designer and Planner",
    projectFunction: "",
    awardFeature: "",
    size: "7,847 m2",
    location: "Maharlou, Fars, Iran",
    status: "Commissioned to Build",
    client:
      "School Renovation, Development, and Equipping Organization in collaboration with Fars Province Governor Office",
    team: "",
    specificRoles: "",
    timeline: "",
    summary:
      "This project harnesses the critical imagination to generate communities without boundaries through artivism, providing a more dignified and respectful co-learning environment.",
    essay: `This project harnesses the critical imagination to generate communities without boundaries through artivism, providing a more dignified and respectful co-learning environment.

Developed under government tenure with the School Renovation, Development, and Equipping Organization in collaboration with Fars Province Governor Office, it treats architecture as a form of communication — a spatial language through which communities can meet without the usual hard edges of enclosure.

The 7,847 m2 commission in Maharlou, Fars, Iran is designed as a co-learning campus whose built elements are meant to objectify ordinary school parts (wall, court, frame, stair) into space-makers, so that the institution can host more than one community at once.`,
    images: numberedImages("among-community", 23),
    imageCount: 23,
    tags: ["Artivism", "Education", "Community", "Proxemics"],
  },
  {
    slug: "at-the-threshold-of-not-being-and-being",
    title: "at the threshold of not-being and being",
    subtitle: "planning as guardian of memory and meaning",
    year: 2019,
    projectType: "competition, research-based design",
    architect: "Seyed Javad (aka payman) Tahghighi Jahromi",
    firm: "-",
    position: "architectural designer and planner",
    projectFunction: "university gateway",
    awardFeature: thresholdAwardFeature,
    size: "238 m²",
    location: "Shiraz, Fars, Iran",
    status: "not realized",
    client:
      "Shiraz University, Iran’s Ministry of Science, Research, and Technology, and Iran’s Secretariat of Architectural and Urban Competitions.",
    team: "(2) Me and My colleague (Hemn Amani; design technologist at SBU)",
    specificRoles:
      "I was responsible for all stages of initial design through publication, including: conceptualization; design phase; rendering and visualizing; urban analysing; writing; documenting; photography, library- and archive-searching.",
    timeline: "design: 2019, research: 2022-2024",
    summary:
      "This research-based design explores the relationship between internal and external references of a construction in order to raise a solid form to an art form, utilizing the inter-consciousness and inner-consciousness of architecture.",
    essay: thresholdEssay,
    images: numberedImages("at-the-threshold-of-not-being-and-being", 33),
    imageCount: 33,
    tags: ["Competition", "Research", "Urbanism", "Gateway"],
  },
];
