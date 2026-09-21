"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./DesktopFooter.module.css";

interface DesktopFooterProps {
  onOpenWindow?: (id: "about" | "cv" | "work", slug?: string | null) => void;
  isWindowOpen?: boolean;
  onOverlayChange?: (active: boolean) => void;
}

export default function DesktopFooter({
  onOpenWindow,
  isWindowOpen = false,
  onOverlayChange,
}: DesktopFooterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stretchHeight, setStretchHeight] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [viewportH, setViewportH] = useState(800);

  const overscrollYRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchBaseStretchRef = useRef(0);
  const isExpandedRef = useRef(false);
  const stretchHeightRef = useRef<number | null>(null);
  const isWindowOpenRef = useRef(isWindowOpen);
  const footerRef = useRef<HTMLElement>(null);
  const releaseTimerRef = useRef<number | null>(null);
  const gradientXRef = useRef(48);
  const gradientTargetRef = useRef(48);
  const gradientRafRef = useRef<number | null>(null);
  const gradientHoverRef = useRef(false);
  const isReleasingRef = useRef(false);
  const lastInputAtRef = useRef(0);
  const stretchRafRef = useRef<number | null>(null);
  const displayHeightRef = useRef(0);
  const expandedHeightRef = useRef(200);
  const maxStretchHeightRef = useRef(600);
  const collapseIntentRef = useRef(0);
  const touchHoldingRef = useRef(false);
  const tickStretchRef = useRef<() => void>(() => {});
  const [footerBoxH, setFooterBoxH] = useState(80);
  const [isReleasing, setIsReleasing] = useState(false);

  const COLLAPSED_RATIO = 0.095;
  const EXPANDED_RATIO = 0.22;
  const STRETCHED_RATIO = 0.753;
  const DAMPENING = 0.32;
  const RELEASE_IDLE_MS = 520;
  const FOLLOW_EASE = 0.18;
  const RELEASE_EASE = 0.08;
  const WHEEL_TICK_CAP = 72;
  const TOP_HOLD_PX = 10;

  const collapsedHeight = Math.max(78, Math.round(viewportH * COLLAPSED_RATIO));
  const expandedHeight = Math.max(200, Math.round(viewportH * EXPANDED_RATIO));
  const maxStretchHeight = Math.round(viewportH * STRETCHED_RATIO);

  isExpandedRef.current = isExpanded;
  stretchHeightRef.current = stretchHeight;
  isWindowOpenRef.current = isWindowOpen;
  expandedHeightRef.current = expandedHeight;
  maxStretchHeightRef.current = maxStretchHeight;

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const sync = () => setFooterBoxH(el.getBoundingClientRect().height);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isExpanded, stretchHeight]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${hours} : ${minutes} : ${seconds}`);

      const day = String(now.getDate()).padStart(2, "0");
      const month = now.toLocaleString("en-US", { month: "long" }).toLowerCase();
      setCurrentDate(`${day} ${month} ${now.getFullYear()}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncViewport = () => setViewportH(window.innerHeight);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  const clearReleaseTimer = useCallback(() => {
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }, []);

  const stopStretchLoop = useCallback(() => {
    if (stretchRafRef.current !== null) {
      window.cancelAnimationFrame(stretchRafRef.current);
      stretchRafRef.current = null;
    }
  }, []);

  const heightFromExtra = useCallback((extra: number) => {
    const expanded = expandedHeightRef.current;
    const range = Math.max(1, maxStretchHeightRef.current - expanded);
    const raw = Math.max(0, extra) * DAMPENING;
    return expanded + range * (1 - Math.exp(-raw / range));
  }, []);

  const extraFromHeight = useCallback((h: number) => {
    const expanded = expandedHeightRef.current;
    const range = Math.max(1, maxStretchHeightRef.current - expanded);
    const t = Math.min(0.999, Math.max(0, (h - expanded) / range));
    return (-range / DAMPENING) * Math.log(1 - t);
  }, []);

  const collapseToRest = useCallback(() => {
    clearReleaseTimer();
    stopStretchLoop();
    overscrollYRef.current = 0;
    collapseIntentRef.current = 0;
    displayHeightRef.current = 0;
    isReleasingRef.current = false;
    setIsReleasing(false);
    setStretchHeight(null);
    setIsExpanded(false);
    setIsAnimating(true);
    window.setTimeout(() => setIsAnimating(false), 700);
  }, [clearReleaseTimer, stopStretchLoop]);

  const expandToBar = useCallback(() => {
    clearReleaseTimer();
    stopStretchLoop();
    overscrollYRef.current = 0;
    collapseIntentRef.current = 0;
    displayHeightRef.current = expandedHeightRef.current;
    isReleasingRef.current = false;
    setIsReleasing(false);
    setStretchHeight(null);
    setIsExpanded(true);
    setIsAnimating(true);
    window.setTimeout(() => setIsAnimating(false), 700);
  }, [clearReleaseTimer, stopStretchLoop]);

  const startStretchLoop = useCallback(() => {
    if (stretchRafRef.current !== null) return;
    stretchRafRef.current = window.requestAnimationFrame(() => {
      tickStretchRef.current();
    });
  }, []);

  tickStretchRef.current = () => {
    const now = performance.now();
    const expanded = expandedHeightRef.current;
    const maxH = maxStretchHeightRef.current;
    if (touchHoldingRef.current) {
      lastInputAtRef.current = now;
    }
    const idle = now - lastInputAtRef.current;

    if (
      !isReleasingRef.current &&
      !touchHoldingRef.current &&
      idle >= RELEASE_IDLE_MS &&
      (displayHeightRef.current > expanded + 1 || overscrollYRef.current > 0)
    ) {
      isReleasingRef.current = true;
      overscrollYRef.current = 0;
      setIsReleasing(true);
    }

    let target = isReleasingRef.current
      ? expanded
      : Math.min(maxH, heightFromExtra(overscrollYRef.current));

    if (!isReleasingRef.current && idle < RELEASE_IDLE_MS && target >= maxH - TOP_HOLD_PX) {
      target = maxH;
      overscrollYRef.current = Math.max(overscrollYRef.current, extraFromHeight(maxH));
    }

    const ease = isReleasingRef.current ? RELEASE_EASE : FOLLOW_EASE;
    const current = displayHeightRef.current || expanded;
    let next = current + (target - current) * ease;
    if (Math.abs(target - next) < 0.35) next = target;
    displayHeightRef.current = next;

    const rounded = Math.round(next);
    if (stretchHeightRef.current !== rounded) {
      setStretchHeight(rounded);
    }

    const settledLow = next <= expanded + 0.5;
    if (isReleasingRef.current && settledLow) {
      stretchRafRef.current = null;
      displayHeightRef.current = expanded;
      overscrollYRef.current = 0;
      isReleasingRef.current = false;
      setStretchHeight(null);
      setIsReleasing(false);
      setIsAnimating(false);
      return;
    }

    stretchRafRef.current = window.requestAnimationFrame(() => {
      tickStretchRef.current();
    });
  };

  const absorbStretchDelta = useCallback(
    (delta: number) => {
      if (isWindowOpenRef.current) return;

      lastInputAtRef.current = performance.now();
      collapseIntentRef.current = 0;

      if (!isExpandedRef.current) {
        isExpandedRef.current = true;
        setIsExpanded(true);
        setIsAnimating(false);
      }

      if (displayHeightRef.current < collapsedHeight) {
        displayHeightRef.current = footerRef.current?.getBoundingClientRect().height ?? collapsedHeight;
      }

      if (isReleasingRef.current) {
        isReleasingRef.current = false;
        setIsReleasing(false);
        overscrollYRef.current = extraFromHeight(displayHeightRef.current);
      }

      const maxH = maxStretchHeightRef.current;
      const nextExtra = Math.max(0, overscrollYRef.current + delta);
      const nextHeight = heightFromExtra(nextExtra);

      if (delta > 0 && nextHeight >= maxH - TOP_HOLD_PX) {
        overscrollYRef.current = extraFromHeight(maxH);
      } else {
        overscrollYRef.current = nextExtra;
      }

      startStretchLoop();
    },
    [collapsedHeight, extraFromHeight, heightFromExtra, startStretchLoop]
  );

  const applyGradientCenter = useCallback((x: number) => {
    footerRef.current?.style.setProperty("--g-center", `${x}%`);
  }, []);

  const tickGradient = useCallback(() => {
    const target = gradientHoverRef.current ? gradientTargetRef.current : 48;
    const ease = gradientHoverRef.current ? 0.35 : 0.12;
    const next = gradientXRef.current + (target - gradientXRef.current) * ease;
    if (Math.abs(target - next) < 0.08) {
      gradientXRef.current = target;
      applyGradientCenter(target);
      gradientRafRef.current = null;
      return;
    }
    gradientXRef.current = next;
    applyGradientCenter(next);
    gradientRafRef.current = window.requestAnimationFrame(tickGradient);
  }, [applyGradientCenter]);

  const startGradientTick = useCallback(() => {
    if (gradientRafRef.current === null) {
      gradientRafRef.current = window.requestAnimationFrame(tickGradient);
    }
  }, [tickGradient]);

  useEffect(() => {
    return () => {
      if (gradientRafRef.current !== null) {
        window.cancelAnimationFrame(gradientRafRef.current);
      }
      if (stretchRafRef.current !== null) {
        window.cancelAnimationFrame(stretchRafRef.current);
      }
    };
  }, []);

  const handleFooterMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    gradientHoverRef.current = true;
    gradientTargetRef.current = Math.min(100, Math.max(0, x));
    startGradientTick();
  };

  const handleFooterMouseLeave = () => {
    gradientHoverRef.current = false;
    gradientTargetRef.current = 48;
    startGradientTick();
  };

  useEffect(() => {
    if (!isWindowOpen) return;
    stopStretchLoop();
    overscrollYRef.current = 0;
    isReleasingRef.current = false;
    setIsReleasing(false);
    setStretchHeight(null);
  }, [isWindowOpen, stopStretchLoop]);

  useEffect(() => {
    const overlaying =
      !isWindowOpen &&
      (isReleasing || (stretchHeight !== null && stretchHeight > expandedHeight + 24));
    onOverlayChange?.(overlaying);
  }, [isReleasing, isWindowOpen, stretchHeight, expandedHeight, onOverlayChange]);

  useEffect(() => {
    const normalizeWheelDelta = (e: WheelEvent) => {
      let y = e.deltaY;
      if (e.deltaMode === 1) y *= 16;
      else if (e.deltaMode === 2) y *= window.innerHeight * 0.7;
      return Math.max(-WHEEL_TICK_CAP, Math.min(WHEEL_TICK_CAP, y));
    };

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        typeof target.closest === "function" &&
        (target.closest("[data-window-content]") ||
          target.closest("pre") ||
          target.closest("[data-mac-window]"))
      ) {
        return;
      }

      const delta = normalizeWheelDelta(e);
      if (delta === 0) return;

      const expanded = isExpandedRef.current;
      const windowOpen = isWindowOpenRef.current;
      const maxH = maxStretchHeightRef.current;
      const stretching =
        stretchHeightRef.current !== null ||
        overscrollYRef.current > 0 ||
        isReleasingRef.current ||
        displayHeightRef.current > expandedHeightRef.current + 1;

      if (delta > 0) {
        e.preventDefault();
        if (windowOpen) return;
        absorbStretchDelta(delta);
        return;
      }

      if (stretching) {
        e.preventDefault();
        if (
          !isReleasingRef.current &&
          displayHeightRef.current >= maxH - TOP_HOLD_PX
        ) {
          lastInputAtRef.current = performance.now();
          return;
        }
        absorbStretchDelta(delta);
        return;
      }

      if (expanded && !windowOpen) {
        e.preventDefault();
        collapseIntentRef.current += -delta;
        if (collapseIntentRef.current > 90) {
          collapseToRest();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearReleaseTimer();
    };
  }, [absorbStretchDelta, clearReleaseTimer, collapseToRest]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchHoldingRef.current = true;
      touchStartYRef.current = e.touches[0].clientY;
      touchBaseStretchRef.current = overscrollYRef.current;
      lastInputAtRef.current = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        typeof target.closest === "function" &&
        (target.closest("[data-window-content]") || target.closest("[data-mac-window]"))
      ) {
        return;
      }

      const deltaY = touchStartYRef.current - e.touches[0].clientY;
      const expanded = isExpandedRef.current;
      const windowOpen = isWindowOpenRef.current;
      const stretching =
        stretchHeightRef.current !== null ||
        overscrollYRef.current > 0 ||
        isReleasingRef.current;

      if (deltaY > 8) {
        e.preventDefault();
        if (windowOpen) return;
        lastInputAtRef.current = performance.now();
        if (!isExpandedRef.current) {
          isExpandedRef.current = true;
          setIsExpanded(true);
          setIsAnimating(false);
        }
        if (displayHeightRef.current < collapsedHeight) {
          displayHeightRef.current =
            footerRef.current?.getBoundingClientRect().height ?? collapsedHeight;
        }
        if (isReleasingRef.current) {
          isReleasingRef.current = false;
          setIsReleasing(false);
        }
        const maxH = maxStretchHeightRef.current;
        const nextExtra = Math.max(0, touchBaseStretchRef.current + deltaY - 8);
        const nextHeight = heightFromExtra(nextExtra);
        overscrollYRef.current =
          nextHeight >= maxH - TOP_HOLD_PX ? extraFromHeight(maxH) : nextExtra;
        startStretchLoop();
      } else if (stretching && deltaY < -12) {
        e.preventDefault();
        lastInputAtRef.current = performance.now();
        if (displayHeightRef.current >= maxStretchHeightRef.current - TOP_HOLD_PX) {
          return;
        }
        overscrollYRef.current = Math.max(0, touchBaseStretchRef.current + deltaY);
        startStretchLoop();
      } else if (expanded && !windowOpen && !stretching && deltaY < -48) {
        collapseToRest();
      }
    };

    const handleTouchEnd = () => {
      touchHoldingRef.current = false;
      lastInputAtRef.current = performance.now();
      startStretchLoop();
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [
    collapsedHeight,
    collapseToRest,
    extraFromHeight,
    heightFromExtra,
    startStretchLoop,
  ]);

  const isStretching =
    !isWindowOpen &&
    (isReleasing || (stretchHeight !== null && stretchHeight > expandedHeight));

  const pillBottom = footerBoxH;

  const handleTopPageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    collapseToRest();
  };

  const handlePillClick = () => {
    if (isStretching || isExpanded) {
      collapseToRest();
    } else {
      expandToBar();
    }
  };

  const handleFooterClick = () => {
    if (!isExpanded) expandToBar();
  };

  const footerHeightStyle = stretchHeight !== null
    ? {
        height: `${stretchHeight}px`,
        transition: "none",
      }
    : {
        height: isExpanded ? "auto" : `${collapsedHeight}px`,
        minHeight: isExpanded ? `${expandedHeight}px` : undefined,
        transition: "height 450ms cubic-bezier(0.16, 1, 0.3, 1)",
      };

  return (
    <>
      <button
        type="button"
        data-desktop-footer
        className={styles.mouseScrollPill}
        style={{
          bottom: `${pillBottom + 12}px`,
          transition: isStretching || isReleasing
            ? "none"
            : isAnimating
              ? "bottom 720ms cubic-bezier(0.16, 1, 0.3, 1)"
              : "bottom 450ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={handlePillClick}
        aria-label={isExpanded ? "Collapse footer" : "Expand footer"}
      >
        <span className={styles.mousePillBody}>
          <span className={styles.mouseWheelDot} />
        </span>
      </button>

      <footer
        ref={footerRef}
        data-desktop-footer
        className={`${styles.footer} ${isExpanded ? styles.expanded : styles.collapsed} ${
          isStretching ? styles.stretching : ""
        }`}
        style={footerHeightStyle}
        onClick={handleFooterClick}
        onMouseMove={handleFooterMouseMove}
        onMouseLeave={handleFooterMouseLeave}
      >
        <div className={styles.disciplineRow}>
          <div className={styles.disciplineLeft}>architecture x philosophy</div>
          <div className={styles.disciplineCenter}>architecture x urbanism</div>
          <div className={styles.disciplineRight}>architecture x technology</div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.colAuthor}>
            <div className={styles.authorName}>
              SEYED JAVAD (aka PAYMAN) TAHGHIGHI JAHROMI
            </div>
            <a
              href="mailto:paymantahghighi@gmail.com"
              className={styles.authorEmail}
              onClick={(e) => e.stopPropagation()}
            >
              paymantahghighi@gmail.com
            </a>
          </div>

          <div className={styles.colsSecondary}>
            <div className={styles.colDownloads}>
              <div className={styles.sectionHeader}>downloads</div>
              <div className={styles.linkList}>
                <a
                  href="/assets/cv/cv.pdf"
                  download="Payman_Tahghighi_Abridged_CV.pdf"
                  className={styles.footerLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  abridged cv (1-page)
                </a>
                <a
                  href="/assets/cv/cv.pdf"
                  download="Payman_Tahghighi_Extended_CV.pdf"
                  className={styles.footerLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  extended cv (9-pages)
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenWindow?.("work");
                  }}
                  className={`${styles.footerLink} ${styles.linkBtn}`}
                >
                  abridged portfolio (28-pages)
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenWindow?.("work");
                  }}
                  className={`${styles.footerLink} ${styles.linkBtn}`}
                >
                  extended portfolio (36-pages)
                </button>
              </div>
            </div>

            <div className={styles.colLinks}>
              <div className={styles.sectionHeader}>links</div>
              <div className={styles.linkList}>
                <a
                  href="https://instagram.com/paymantahghighi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  instagram
                </a>
                <a
                  href="https://linkedin.com/in/paymantahghighi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  linkedin
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.bottomCopyright}>
            &copy; 2026 copyright by Seyed Javad Tahghighi Jahromi. all rights reserved.
          </div>
          <div className={styles.bottomDate}>{currentDate || "08 september 2026"}</div>
          <div className={styles.bottomClock}>{currentTime || "18 : 40 : 44"}</div>
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
