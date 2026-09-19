"use client";

import React, { useState } from "react";
import Image from "next/image";
import { workProjects } from "@/lib/data";
import styles from "./WorkWindow.module.css";

export default function WorkWindow({
  selectedSlug,
  onSelectProject,
}: {
  selectedSlug?: string | null;
  onSelectProject?: (slug: string | null) => void;
}) {
  const [internalSlug, setInternalSlug] = useState<string | null>(selectedSlug || null);
  const activeSlug = selectedSlug !== undefined ? selectedSlug : internalSlug;

  const handleSelect = (slug: string | null) => {
    setInternalSlug(slug);
    if (onSelectProject) onSelectProject(slug);
  };

  const project = activeSlug ? workProjects.find((p) => p.slug === activeSlug) : null;

  return (
    <div className={styles.workContainer}>
      <div className={styles.workSubToolbar}>
        <div className={styles.pathBreadcrumb}>
          <span className={styles.pathSegment}>SpaceScapeStudio</span>
          <span className={styles.pathDivider}>›</span>
          <span className={styles.pathSegment}>Portfolio</span>
          <span className={styles.pathDivider}>›</span>
          <span className={styles.pathSegmentActive}>
            {project ? project.title : "Work Volume"}
          </span>
        </div>
        {project && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => handleSelect(null)}
          >
            ← Back to Index
          </button>
        )}
      </div>

      {!project ? (
        <div className={styles.listWrapper}>
          <header className={styles.listHeader}>
            <p className={styles.listEyebrow}>Selected Projects &amp; Research</p>
            <h1 className={styles.listHeading}>Work Volume</h1>
          </header>

          <div className={styles.projectsList}>
            {workProjects.map((item, idx) => (
              <div
                key={item.slug}
                className={styles.projectRow}
                onClick={() => handleSelect(item.slug)}
              >
                <span className={styles.projectIndex}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className={styles.titleBlock}>
                  <h2 className={styles.projectTitle}>{item.title}</h2>
                  <p className={styles.projectSubtitle}>{item.subtitle}</p>
                </div>
                <div className={styles.metaBlock}>
                  <span>{item.year}</span>
                  <span>{item.size}</span>
                  <span>{item.location}</span>
                </div>
                <div className={styles.tagsBlock}>
                  {item.tags.map((tag) => (
                    <span key={tag} className={styles.tagBadge}>
                      {tag}
                    </span>
                  ))}
                </div>
                <span className={styles.arrowIcon}>→</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.detailWrapper}>
          <div className={styles.detailHeader}>
            <div>
              <h1 className={styles.detailTitle}>{project.title}</h1>
              <p className={styles.detailSubtitle}>{project.subtitle}</p>
            </div>

            <div>
              <dl className={styles.specsTable}>
                <dt className={styles.specKey}>Project Type</dt>
                <dd className={styles.specVal}>{project.projectType}</dd>
                <dt className={styles.specKey}>Position</dt>
                <dd className={styles.specVal}>{project.position}</dd>
                <dt className={styles.specKey}>Location</dt>
                <dd className={styles.specVal}>{project.location}</dd>
                <dt className={styles.specKey}>Scale</dt>
                <dd className={styles.specVal}>{project.size}</dd>
                <dt className={styles.specKey}>Status</dt>
                <dd className={styles.specVal}>{project.status}</dd>
              </dl>
              <p className={styles.detailSummary}>{project.summary}</p>
            </div>

            <div>
              <div className={styles.tagsBlock}>
                {project.tags.map((tag) => (
                  <span key={tag} className={styles.tagBadge}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.galleryGrid}>
            {Array.from({ length: project.imageCount }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={`${styles.galleryItem} ${
                  n === 1 || n === 16 ? styles.galleryFull : ""
                }`}
              >
                <Image
                  src={`/assets/work/among-community/${String(n).padStart(2, "0")}.svg`}
                  alt={`${project.title} — Drawing ${n}`}
                  width={1200}
                  height={800}
                  className={styles.galleryImg}
                  unoptimized
                />
                <div className={styles.galleryCaption}>
                  Drawing {String(n).padStart(2, "0")} / {project.imageCount} &bull; {project.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}