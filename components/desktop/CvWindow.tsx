import styles from "./CvWindow.module.css";
import type { AwardEntry, EducationEntry, ExperienceEntry, ResearchEntry } from "@/lib/portfolio-types";

export default function CvWindow({
  education,
  research,
  awards,
  experience,
}: {
  education: EducationEntry[];
  research: ResearchEntry[];
  awards: AwardEntry[];
  experience: ExperienceEntry[];
}) {
  return (
    <div className={styles.cvContainer}>
      <div className={styles.cvGrid}>
        <div className={styles.columnLeft}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>EDUCATION</h2>
            <div className={styles.entryList}>
              {education.map((item) => (
                <div className={styles.entryRow} key={item.id}>
                  <span className={styles.entryDate}>{item.dateRange}</span>
                  <div className={styles.entryContent}>
                    <div className={styles.itemTitle}>{item.degree}</div>
                    <div className={styles.itemDesc}>{item.institution}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>RESEARCH INTEREST(S)</h2>
            <div className={styles.researchList}>
              {research.map((item) => (
                <div className={styles.researchItem} key={item.id}>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemDesc}>{item.description}</div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>AWARD and HONOR</h2>
            <div className={styles.entryList}>
              {awards.map((item) => {
                const [first, ...rest] = item.description.split("\n");
                return (
                  <div className={styles.entryRow} key={item.id}>
                    <span className={styles.entryDate}>{item.year}</span>
                    <div className={styles.entryContent}>
                      <div>
                        <span className={styles.itemTitle}>{item.title}</span>{" "}
                        <span className={styles.itemDesc}>{first}</span>
                      </div>
                      {rest.map((line) => (
                        <div key={line} style={{ marginTop: 2 }}>
                          <span className={styles.itemDesc}>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className={styles.columnRight}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</h2>
            <div className={styles.entryList}>
              {experience.map((item) => (
                <div className={styles.entryRow} key={item.id}>
                  <span className={styles.entryDate}>{item.dateRange}</span>
                  <div className={styles.entryContent}>
                    <span className={styles.itemTitle}>{item.organization}</span>,{" "}
                    <span className={styles.itemDescInline}>{item.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
