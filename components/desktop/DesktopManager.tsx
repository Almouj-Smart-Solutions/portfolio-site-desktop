"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import MacWindow from "./MacWindow";
import AboutWindow from "./AboutWindow";
import CvWindow from "./CvWindow";
import WorkWindow from "./WorkWindow";
import DesktopFooter from "./DesktopFooter";
import styles from "./DesktopManager.module.css";

export type WindowId = "about" | "cv" | "work";

interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface DesktopManagerProps {
  initialOpenWindow?: WindowId | null;
  initialSlug?: string | null;
}

export default function DesktopManager({
  initialOpenWindow = null,
  initialSlug = null,
}: DesktopManagerProps) {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
    about: {
      isOpen: initialOpenWindow === "about",
      isMinimized: false,
      isMaximized: false,
      zIndex: initialOpenWindow === "about" ? 20 : 10,
    },
    cv: {
      isOpen: initialOpenWindow === "cv",
      isMinimized: false,
      isMaximized: false,
      zIndex: initialOpenWindow === "cv" ? 20 : 10,
    },
    work: {
      isOpen: initialOpenWindow === "work",
      isMinimized: false,
      isMaximized: false,
      zIndex: initialOpenWindow === "work" ? 20 : 10,
    },
  });

  const [activeWindowId, setActiveWindowId] = useState<WindowId | null>(initialOpenWindow);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug);
  const [highestZIndex, setHighestZIndex] = useState<number>(30);

  const focusWindow = (id: WindowId) => {
    setActiveWindowId(id);
    setHighestZIndex((prev) => {
      const nextZ = prev + 1;
      setWindows((w) => ({
        ...w,
        [id]: {
          ...w[id],
          zIndex: nextZ,
          isMinimized: false,
        },
      }));
      return nextZ;
    });
  };

  const openWindow = (id: WindowId, slug?: string | null) => {
    if (id === "work" && slug !== undefined) {
      setSelectedSlug(slug);
    }
    setHighestZIndex((prev) => {
      const nextZ = prev + 1;
      setWindows((w) => ({
        ...w,
        [id]: {
          isOpen: true,
          isMinimized: false,
          isMaximized: w[id].isMaximized,
          zIndex: nextZ,
        },
      }));
      setActiveWindowId(id);
      return nextZ;
    });
  };

  const closeWindow = (id: WindowId) => {
    setWindows((w) => ({
      ...w,
      [id]: { ...w[id], isOpen: false, isMinimized: false },
    }));
    if (activeWindowId === id) {
      const remainingOpen = Object.entries(windows).filter(
        ([wId, state]) => wId !== id && state.isOpen && !state.isMinimized
      );
      if (remainingOpen.length > 0) {
        remainingOpen.sort((a, b) => b[1].zIndex - a[1].zIndex);
        setActiveWindowId(remainingOpen[0][0] as WindowId);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeWindow = (id: WindowId) => {
    setWindows((w) => ({
      ...w,
      [id]: { ...w[id], isMinimized: true },
    }));
    if (activeWindowId === id) {
      const remainingOpen = Object.entries(windows).filter(
        ([wId, state]) => wId !== id && state.isOpen && !state.isMinimized
      );
      if (remainingOpen.length > 0) {
        remainingOpen.sort((a, b) => b[1].zIndex - a[1].zIndex);
        setActiveWindowId(remainingOpen[0][0] as WindowId);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const maximizeWindow = (id: WindowId) => {
    focusWindow(id);
    setWindows((w) => ({
      ...w,
      [id]: { ...w[id], isMaximized: !w[id].isMaximized },
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "w")) {
        if (activeWindowId) {
          e.preventDefault();
          closeWindow(activeWindowId);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
        if (activeWindowId) {
          e.preventDefault();
          minimizeWindow(activeWindowId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeWindowId]);

  const isAnyWindowOpen = Object.values(windows).some((w) => w.isOpen && !w.isMinimized);


  return (
    <div className={styles.desktopCanvas}>
      {/* Desktop Icons Layer */}
      <div className={`${styles.desktopIconsLayer} ${isAnyWindowOpen ? styles.dimmed : ""}`}>
        <button
          type="button"
          className={`${styles.desktopIcon} ${
            activeWindowId === "about" && windows.about.isOpen ? styles.desktopIconSelected : ""
          }`}
          onClick={() => openWindow("about")}
        >
          <div className={styles.iconWrapper}>
            <Image
              src="/assets/homepage/about-me.png"
              alt="About Me"
              width={88}
              height={88}
              priority
              className={styles.iconImg}
            />
          </div>
          <span className={styles.iconLabel}>about me.rtf</span>
        </button>

        <button
          type="button"
          className={`${styles.desktopIcon} ${
            activeWindowId === "cv" && windows.cv.isOpen ? styles.desktopIconSelected : ""
          }`}
          onClick={() => openWindow("cv")}
        >
          <div className={styles.iconWrapper}>
            <Image
              src="/assets/homepage/Asset 2.svg"
              alt="CV"
              width={88}
              height={88}
              priority
              className={styles.iconImg}
            />
          </div>
          <span className={styles.iconLabel}>cv.rtf</span>
        </button>

        <button
          type="button"
          className={`${styles.desktopIcon} ${
            activeWindowId === "work" && windows.work.isOpen ? styles.desktopIconSelected : ""
          }`}
          onClick={() => openWindow("work")}
        >
          <div className={styles.iconWrapper}>
            <Image
              src="/assets/homepage/work-volume.png"
              alt="Work Volume"
              width={88}
              height={88}
              priority
              className={styles.iconImg}
            />
          </div>
          <span className={styles.iconLabel}>work volume</span>
        </button>
      </div>

      {/* About Window */}
      <MacWindow
        id="about"
        title="about me"
        variant="about"
        isOpen={windows.about.isOpen}
        isMinimized={windows.about.isMinimized}
        isMaximized={windows.about.isMaximized}
        isActive={activeWindowId === "about"}
        zIndex={windows.about.zIndex}
        initialPosition={{ x: 60, y: 55 }}
        initialSize={{ width: 550, height: 740 }}
        onClose={() => closeWindow("about")}
        onMinimize={() => minimizeWindow("about")}
        onMaximize={() => maximizeWindow("about")}
        onFocus={() => focusWindow("about")}
      >
        <AboutWindow />
      </MacWindow>

      {/* CV Window */}
      <MacWindow
        id="cv"
        title="curriculum vitae"
        variant="cv"
        isOpen={windows.cv.isOpen}
        isMinimized={windows.cv.isMinimized}
        isMaximized={windows.cv.isMaximized}
        isActive={activeWindowId === "cv"}
        zIndex={windows.cv.zIndex}
        initialPosition={{ x: 80, y: 55 }}
        initialSize={{ width: 620, height: 780 }}
        onClose={() => closeWindow("cv")}
        onMinimize={() => minimizeWindow("cv")}
        onMaximize={() => maximizeWindow("cv")}
        onFocus={() => focusWindow("cv")}
      >
        <CvWindow />
      </MacWindow>

      {/* Work Volume Window */}
      <MacWindow
        id="work"
        title="Work Volume — Architecture &amp; Research"
        badge="Volume"
        iconSrc="/assets/homepage/work-volume.png"
        isOpen={windows.work.isOpen}
        isMinimized={windows.work.isMinimized}
        isMaximized={windows.work.isMaximized}
        isActive={activeWindowId === "work"}
        zIndex={windows.work.zIndex}
        initialPosition={{ x: 100, y: 65 }}
        initialSize={{ width: 1060, height: 740 }}
        onClose={() => closeWindow("work")}
        onMinimize={() => minimizeWindow("work")}
        onMaximize={() => maximizeWindow("work")}
        onFocus={() => focusWindow("work")}
      >
        <WorkWindow
          selectedSlug={selectedSlug}
          onSelectProject={(slug) => setSelectedSlug(slug)}
        />
      </MacWindow>


      {/* Interactive Elastic Stretching Footer Bar */}
      <DesktopFooter onOpenWindow={openWindow} />
    </div>
  );
}