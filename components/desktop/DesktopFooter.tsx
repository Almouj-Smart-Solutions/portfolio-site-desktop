"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./DesktopFooter.module.css";

interface DesktopFooterProps {
  onOpenWindow?: (id: "about" | "cv" | "work", slug?: string | null) => void;
}

export default function DesktopFooter({ onOpenWindow }: DesktopFooterProps) {
  // Footer state: collapsed (Page 1), expanded (Page 2), or stretching (Page 4)
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [stretchHeight, setStretchHeight] = useState<number | null>(null);
  const [isReleasing, setIsReleasing] = useState<boolean>(false);

  // Time & Date state
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Refs for tracking wheel / gesture momentum
  const overscrollYRef = useRef<number>(0);
  const releaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef<number>(0);
  const footerRef = useRef<HTMLElement>(null);

  // Constants (px)
  const COLLAPSED_HEIGHT = 62; // Page 1 height
  const EXPANDED_HEIGHT = 152; // Page 2 height

  // Real-time clock and formatted date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Time: "18 : 40 : 44"
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${hours} : ${minutes} : ${seconds}`);

      // Date: "08 september 2026"
      const day = String(now.getDate()).padStart(2, "0");
      const month = now.toLocaleString("en-US", { month: "long" }).toLowerCase();
      const year = now.getFullYear();
      setCurrentDate(`${day} ${month} ${year}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger smooth spring release from Page 4 stretch back to Page 2
  const triggerRelease = useCallback(() => {
    setIsReleasing(true);
    overscrollYRef.current = 0;
    setStretchHeight(null);

    // Reset release transition flag after animation finishes
    setTimeout(() => {
      setIsReleasing(false);
    }, 700);
  }, []);

  // Wheel event listener for viewport
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If user scrolls inside an open window modal content, allow normal window scroll
      const target = e.target as HTMLElement;
      if (
        target.closest("[data-window-content]") ||
        target.closest("pre") ||
        target.closest(".windowContent")
      ) {
        return;
      }

      const delta = e.deltaY;
      const maxHeight = window.innerHeight * 0.70; // 70% of screen height

      if (delta > 0) {
        // Scrolling DOWN
        if (!isExpanded) {
          // Page 1 -> Page 2
          setIsExpanded(true);
          overscrollYRef.current = 0;
        } else {
          // Page 2 -> Page 4 (Elastic stretching)
          if (releaseTimerRef.current) {
            clearTimeout(releaseTimerRef.current);
          }
          setIsReleasing(false);

          // Dampening resistance curve
          overscrollYRef.current += delta;
          const dampening = 0.42;
          const calculatedHeight = Math.min(
            maxHeight,
            EXPANDED_HEIGHT + overscrollYRef.current * dampening
          );

          setStretchHeight(calculatedHeight);

          // Debounce: when user stops scrolling down, release smoothly back to Page 2
          releaseTimerRef.current = setTimeout(() => {
            triggerRelease();
          }, 180);
        }
      } else if (delta < 0) {
        // Scrolling UP
        if (stretchHeight !== null && stretchHeight > EXPANDED_HEIGHT) {
          // If stretching, reduce stretch
          overscrollYRef.current = Math.max(0, overscrollYRef.current + delta);
          const calculatedHeight = Math.max(
            EXPANDED_HEIGHT,
            EXPANDED_HEIGHT + overscrollYRef.current * 0.42
          );
          setStretchHeight(calculatedHeight === EXPANDED_HEIGHT ? null : calculatedHeight);
        } else if (isExpanded) {
          // From Page 2 back to Page 1
          if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
          triggerRelease();
          setIsExpanded(false);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    };
  }, [isExpanded, stretchHeight, triggerRelease]);

  // Touch gesture handling (mobile/touch devices)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - currentY; // positive = swipe up (scroll down)
      const maxHeight = window.innerHeight * 0.70;

      if (deltaY > 10) {
        if (!isExpanded) {
          setIsExpanded(true);
        } else {
          setIsReleasing(false);
          const dampening = 0.55;
          const extra = Math.max(0, deltaY - 30);
          const calculatedHeight = Math.min(
            maxHeight,
            EXPANDED_HEIGHT + extra * dampening
          );
          setStretchHeight(calculatedHeight);
        }
      } else if (deltaY < -40 && isExpanded && stretchHeight === null) {
        setIsExpanded(false);
      }
    };

    const handleTouchEnd = () => {
      if (stretchHeight !== null) {
        triggerRelease();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isExpanded, stretchHeight, triggerRelease]);

  // Calculate current height and mouse indicator offset
  const currentHeight =
    stretchHeight !== null
      ? stretchHeight
      : isExpanded
      ? EXPANDED_HEIGHT
      : COLLAPSED_HEIGHT;

  const handleTopPageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    setIsReleasing(true);
    setStretchHeight(null);
    setIsExpanded(false);
    setTimeout(() => setIsReleasing(false), 700);
  };

  const handlePillClick = () => {
    if (isExpanded) {
      handleTopPageClick({ preventDefault: () => {} } as React.MouseEvent);
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <>
      {/* Floating Mouse Scroll Indicator Pill Icon */}
      <button
        type="button"
        className={styles.mouseScrollPill}
        style={{
          bottom: `${currentHeight + 14}px`,
          transition: isReleasing ? "bottom 650ms cubic-bezier(0.16, 1, 0.3, 1)" : "bottom 80ms linear",
        }}
        onClick={handlePillClick}
        aria-label={isExpanded ? "Collapse footer" : "Expand footer / Scroll down"}
        title={isExpanded ? "Click to collapse (or scroll up)" : "Scroll down to expand footer"}
      >
        <span className={styles.mousePillBody}>
          <span className={styles.mouseWheelDot} />
        </span>
      </button>

      {/* Main Gradient Elastic Stretching Footer */}
      <footer
        ref={footerRef}
        className={`${styles.footer} ${isExpanded ? styles.expanded : styles.collapsed} ${
          isReleasing ? styles.releasing : ""
        }`}
        style={{
          height: `${currentHeight}px`,
          transition: isReleasing
            ? "height 650ms cubic-bezier(0.16, 1, 0.3, 1)"
            : stretchHeight !== null
            ? "none"
            : "height 450ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Top Discipline Row (White text: philosophy / urbanism / technology) */}
        <div className={styles.disciplineRow}>
          <div className={styles.disciplineLeft}>architecture x philosophy</div>
          <div className={styles.disciplineCenter}>architecture x urbansim</div>
          <div className={styles.disciplineRight}>architecture x technology</div>
        </div>

        {/* Expanded Content Grid (Revealed in Page 2 & Page 4) */}
        <div className={styles.contentGrid}>
          {/* Column 1: Author Name & Email */}
          <div className={styles.colAuthor}>
            <div className={styles.authorName}>
              SEYED JAVAD (aka PAYMAN) TAHGHIGHI JAHROMI
            </div>
            <a
              href="mailto:paymantahghighi@gmail.com"
              className={styles.authorEmail}
            >
              paymantahghighi@gmail.com
            </a>
          </div>

          {/* Column 2: Downloads */}
          <div className={styles.colDownloads}>
            <div className={styles.sectionHeader}>downloads</div>
            <div className={styles.linkList}>
              <a
                href="/assets/cv/cv.pdf"
                download="Payman_Tahghighi_Abridged_CV.pdf"
                className={styles.footerLink}
              >
                abridged cv (1-page)
              </a>
              <a
                href="/assets/cv/cv.pdf"
                download="Payman_Tahghighi_Extended_CV.pdf"
                className={styles.footerLink}
              >
                extended cv (9-pages)
              </a>
              <button
                type="button"
                onClick={() => onOpenWindow?.("work")}
                className={`${styles.footerLink} ${styles.linkBtn}`}
              >
                abridged portfolio (28-pages)
              </button>
              <button
                type="button"
                onClick={() => onOpenWindow?.("work")}
                className={`${styles.footerLink} ${styles.linkBtn}`}
              >
                extended portfolio (36-pages)
              </button>
            </div>
          </div>

          {/* Column 3: Links */}
          <div className={styles.colLinks}>
            <div className={styles.sectionHeader}>links</div>
            <div className={styles.linkList}>
              <a
                href="https://instagram.com/paymantahghighi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                instagram
              </a>
              <a
                href="https://linkedin.com/in/paymantahghighi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                linkedin
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar: Copyright, Date, Clock, Top of Page */}
        <div className={styles.bottomRow}>
          {/* Bottom Left: Copyright */}
          <div className={styles.bottomCopyright}>
            &copy; 2026 copyright by Seyed Javad Tahghighi Jahromi. all rights reserved.
          </div>

          {/* Bottom Center-Left: Current Date */}
          <div className={styles.bottomDate}>{currentDate || "08 september 2026"}</div>

          {/* Bottom Center-Right: Live Clock */}
          <div className={styles.bottomClock}>{currentTime || "18 : 40 : 44"}</div>

          {/* Bottom Right: Top of the Page action */}
          <div className={styles.bottomTopPage}>
            <button
              type="button"
              className={styles.topPageBtn}
              onClick={handleTopPageClick}
            >
              top of the page
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
