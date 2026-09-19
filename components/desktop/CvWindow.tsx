"use client";

import React from "react";
import styles from "./CvWindow.module.css";

export default function CvWindow() {
  return (
    <div className={styles.cvContainer}>
      <div className={styles.cvGrid}>
        {/* Left Column: Education, Research Interests, Award and Honor */}
        <div className={styles.columnLeft}>
          {/* EDUCATION */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>EDUCATION</h2>
            <div className={styles.entryList}>
              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2018-2021</span>
                <div className={styles.entryContent}>
                  <div className={styles.itemTitle}>Master of Architecture (MArch)</div>
                  <div className={styles.itemDesc}>Shahid Beheshti University, Tehran, Iran</div>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2013-2018</span>
                <div className={styles.entryContent}>
                  <div className={styles.itemTitle}>Bachelor of Architecture (BArch)</div>
                  <div className={styles.itemDesc}>Islamic Azad University, Shiraz, Iran</div>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2009-2013</span>
                <div className={styles.entryContent}>
                  <div className={styles.itemTitle}>Diploma in Mathematics and Physics Discipline (with distinction)</div>
                  <div className={styles.itemDesc}>Forough Andisheh 1 High School</div>
                </div>
              </div>
            </div>
          </section>

          {/* RESEARCH INTEREST(S) */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>RESEARCH INTEREST(S)</h2>
            <div className={styles.researchList}>
              <div className={styles.researchItem}>
                <div className={styles.itemTitle}>OBJECTS and BODIES</div>
                <div className={styles.itemDesc}>intersection of architecture and philosophy</div>
              </div>
              <div className={styles.researchItem}>
                <div className={styles.itemTitle}>LAYERS and CITYSCAPES</div>
                <div className={styles.itemDesc}>intersection of architecture and urbanism</div>
              </div>
              <div className={styles.researchItem}>
                <div className={styles.itemTitle}>SYSTEMS and TECHNOLOGIES</div>
                <div className={styles.itemDesc}>intersection of architecture and technology</div>
              </div>
            </div>
          </section>

          {/* AWARD and HONOR */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>AWARD and HONOR</h2>
            <div className={styles.entryList}>
              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2026</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Achieved Longlisted Mention (top 20)</span>{" "}
                  <span className={styles.itemDesc}>in 6th round of Kooche Magazine Award, Tehran, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2024</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Achieved Honorable Mention Award</span>{" "}
                  <span className={styles.itemDesc}>in 2A Continental Architectural Awards (2ACAA) 2024 in medium-scale architecture category, Dubai, UAE</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2021-2023</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Achieved Fellowship in Iran’s Ministry of Interior</span>,{" "}
                  <span className={styles.itemDesc}>Awarded the specified job title “Civil Affairs’ Development and Urban and Regional Planning Expert” considered directly under “Fars Governace Office” in the form of “Alternative Civilian Service (Amrieh)” in lieu of the Compulsory Military Service which is the most competitive position given to 1% of national graduate students (2 or 3 qouta for applicants per province) each year, Sarvestan, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2023</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 3rd</span>{" "}
                  <span className={styles.itemDesc}>in 2023 Iran National House Award (single-story interior architecture category), collaborative work with VARTA office, Shiraz, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2023</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 3rd</span>{" "}
                  <span className={styles.itemDesc}>in 2023 Archfestival (architecture and society) Award, collaborative work with VARTA office, Shiraz, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2023</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Nominated</span>{" "}
                  <span className={styles.itemDesc}>for 2023 Iran Building of the Year Award, collaborative work with VARTA office, Shiraz, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2022</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 3rd (Bronze Medal)</span>{" "}
                  <span className={styles.itemDesc}>in 2022 National Grand MEMAR Award, collaborative work with VARTA office, Shiraz, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2021</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 2nd (Silver Medal)</span>{" "}
                  <span className={styles.itemDesc}>in 2021 Shiraz MEMAR Award, collaborative work with VARTA office, Shiraz, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2020</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 2nd (Silver Medal)</span>{" "}
                  <span className={styles.itemDesc}>in 2020 Interior Architecture Award of HONAR-e-MEMARI (Magazine Award), collaborative work with VARTA office, Shiraz, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2019</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 3rd (Bronze Medal)</span>{" "}
                  <span className={styles.itemDesc}>in 2019 National Grand MEMAR Award, collaborative work with VARTA office, Shiraz, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2018</span>
                <div className={styles.entryContent}>
                  <div>
                    <span className={styles.itemTitle}>Ranked 10th</span>{" "}
                    <span className={styles.itemDesc}>among more than 20,000 participants from all provinces of Iran in the Nationwide University Entrance Exam knwon as Konkoor in the field of Architectural Engineering, Tehran, Iran</span>
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <span className={styles.itemDesc}>Ranked 1st among 18 fellows of Master of Science in Architectural Engineering based on National Organization of Educational Testing (NOET) results in class of 2018-2021, Tehran, Iran</span>
                  </div>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2018-2021</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Recipient of Full Ride Scholarship</span>{" "}
                  <span className={styles.itemDesc}>for studying Master of Science in Architectural Engineering at Shahid Beheshti University of Tehran from Iran‘s Ministry of Science, Research and Technology, Tehran, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2018</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 18th</span>{" "}
                  <span className={styles.itemDesc}>among more than 20,000 participants from all provinces of Iran in the Nationwide University Entrance Exam knwon as Konkoor in the field of Landscape Architectural Engineering, Tehran, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2018-2021</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Recipient of Full Ride Scholarship</span>{" "}
                  <span className={styles.itemDesc}>for studying Master of Science in Landscape Architectural Engineering at Shahid Beheshti University of Tehran from Iran‘s Ministry of Science, Research and Technology, Tehran, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2018</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 21st</span>{" "}
                  <span className={styles.itemDesc}>among more than 20,000 participants from all provinces of Iran in the Nationwide University Entrance Exam knwon as Konkoor in the field of Interior Architecture, Tehran, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2018-2021</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Recipient of Full Ride Scholarship</span>{" "}
                  <span className={styles.itemDesc}>for studying Master of Interior Architectureg at Art University of Tehran from Iran‘s Ministry of Science, Research and Technology, Tehran, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2018</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 35th</span>{" "}
                  <span className={styles.itemDesc}>among more than 20,000 participants from all provinces of Iran in the Nationwide University Entrance Exam knwon as Konkoor in the field of Master of Science in Iranian Architectural Studies, Tehran, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2017</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 4th</span>{" "}
                  <span className={styles.itemDesc}>in the Province-level Sketching Competition, Shiraz, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2016</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 3rd</span>{" "}
                  <span className={styles.itemDesc}>in the Province-level Sketching Competition, Shiraz, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2010</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Ranked 3rd (Bronze Medal)</span>{" "}
                  <span className={styles.itemDesc}>in Asian Young Designers’ Award, Cairo, Egypt</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Professional Experience */}
        <div className={styles.columnRight}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</h2>
            <div className={styles.entryList}>
              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2023-now</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>SpaceScapeStudio</span>,{" "}
                  <span className={styles.itemDescInline}>Shiraz, Fars, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2021-2023</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>
                    Fars Province Governor Office-Technical and Civil Affairs + Urban Planning Department-Sarvestan Branch
                  </span>,{" "}
                  <span className={styles.itemDescInline}>Sarvestan, Fars, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2020-2021</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>VARTA and PARTNERS office</span>,{" "}
                  <span className={styles.itemDescInline}>Shiraz, Fars, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2020</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>AA-Studio</span>,{" "}
                  <span className={styles.itemDescInline}>Shiraz, Fars, Iran</span>
                </div>
              </div>

              <div className={styles.entryRow}>
                <span className={styles.entryDate}>2014-2015</span>
                <div className={styles.entryContent}>
                  <span className={styles.itemTitle}>Azhdari Associates</span>,{" "}
                  <span className={styles.itemDescInline}>Shiraz, Fars, Iran</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}