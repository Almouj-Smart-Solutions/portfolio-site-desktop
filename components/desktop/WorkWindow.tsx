"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { workProjects } from "@/lib/data";
import styles from "./WorkWindow.module.css";

const VISIBLE = 5;

type Box = { left: number; top: number; width: number; height: number };

type ZoomState = {
  images: string[];
  index: number;
  origin: Box;
};

function containedBox(naturalW: number, naturalH: number): Box {
  const padX = Math.min(160, window.innerWidth * 0.1);
  const padY = Math.min(160, window.innerHeight * 0.1);
  const availW = Math.max(80, window.innerWidth - padX * 2);
  const availH = Math.max(80, window.innerHeight - padY * 2);
  const fit = Math.min(availW / naturalW, availH / naturalH);
  const width = naturalW * fit;
  const height = naturalH * fit;
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  };
}

function ImageZoomOverlay({
  images,
  index,
  origin,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number;
  origin: Box;
  onClose: () => void;
  onIndex: (dir: -1 | 1) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const closingRef = useRef(false);
  const [box, setBox] = useState<Box>(origin);
  const [backdropOn, setBackdropOn] = useState(false);
  const [showUi, setShowUi] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const layoutFromImage = useCallback(() => {
    const img = imgRef.current;
    if (!img?.naturalWidth || !img.naturalHeight) return null;
    return containedBox(img.naturalWidth, img.naturalHeight);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (closingRef.current) return;
      const next = layoutFromImage();
      if (next) setBox(next);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [layoutFromImage]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setBackdropOn(false);
    setBox(origin);
    window.setTimeout(onClose, 280);
  }, [onClose, origin]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (images.length < 2 || closingRef.current) return;
      onIndex(dir);
    },
    [images.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, go]);

  const pingUi = () => {
    setShowUi(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowUi(false), 1500);
  };

  useEffect(() => {
    pingUi();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const onImgLoad = () => {
    if (closingRef.current) return;
    const next = layoutFromImage();
    if (!next) return;
    requestAnimationFrame(() => {
      setBackdropOn(true);
      setBox(next);
    });
  };

  return createPortal(
    <div
      className={`${styles.zoomOverlay} ${backdropOn ? styles.zoomOverlayOpen : ""}`}
      data-image-zoom
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        close();
      }}
      onPointerMove={pingUi}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div className={styles.zoomBackdrop} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={images[index]}
        alt=""
        className={styles.zoomImg}
        style={{
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
        }}
        onLoad={onImgLoad}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        draggable={false}
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.zoomNav} ${styles.zoomNavPrev} ${showUi ? styles.zoomNavVisible : ""}`}
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <rect width="36" height="36" rx="18" />
              <path d="M22.3,28l-10-10l10-10" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.zoomNav} ${styles.zoomNavNext} ${showUi ? styles.zoomNavVisible : ""}`}
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <rect width="36" height="36" rx="18" />
              <path d="M13.7,8l10,10l-10,10" />
            </svg>
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}

function ProjectCarousel({
  images,
  title,
  onZoom,
}: {
  images: string[];
  title: string;
  onZoom: (state: ZoomState) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(VISIBLE);
  const dragRef = useRef({ startX: 0, startDrag: 0, pointerId: -1, moved: false, active: false });
  const indexRef = useRef(0);
  const stepRef = useRef(0);

  const maxIndex = Math.max(0, images.length - visible);

  indexRef.current = index;
  stepRef.current = step;

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const nextVisible = el.clientWidth < 640 ? 2 : VISIBLE;
    const slide = el.querySelector<HTMLElement>(`.${styles.carouselSlide}`);
    const gap = 24;
    const slideSize = slide
      ? slide.getBoundingClientRect().width
      : (el.clientWidth - gap * (nextVisible - 1)) / nextVisible;
    const nextStep = slideSize + gap;
    stepRef.current = nextStep;
    setVisible(nextVisible);
    setStep(nextStep);
  }, []);

  useEffect(() => {
    measure();
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, images.length]);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const clampIndex = (value: number) => Math.max(0, Math.min(maxIndex, value));

  const goTo = (next: number) => {
    setDrag(0);
    setIndex(clampIndex(next));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    dragRef.current = {
      startX: e.clientX,
      startDrag: drag,
      pointerId: e.pointerId,
      moved: false,
      active: true,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 6) dragRef.current.moved = true;
    let next = dragRef.current.startDrag + dx;
    const limit = 48;
    const atStart = indexRef.current <= 0 && next > 0;
    const atEnd = indexRef.current >= maxIndex && next < 0;
    if (atStart || atEnd) next *= 0.28;
    else if (Math.abs(next) > limit && (indexRef.current === 0 || indexRef.current === maxIndex)) {
      next = Math.sign(next) * (limit + (Math.abs(next) - limit) * 0.2);
    }
    setDrag(next);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    e.stopPropagation();
    const wasClick = !dragRef.current.moved;
    dragRef.current.active = false;
    const currentStep = stepRef.current || 1;
    const raw = indexRef.current - drag / currentStep;
    goTo(Math.round(raw));
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }

    if (!wasClick) return;
    const node = document.elementFromPoint(e.clientX, e.clientY);
    const slide = node instanceof Element ? node.closest<HTMLElement>("[data-zoom-index]") : null;
    if (!slide) return;
    const zoomIndex = Number(slide.dataset.zoomIndex);
    if (Number.isNaN(zoomIndex) || !images[zoomIndex]) return;
    const rect = slide.getBoundingClientRect();
    onZoom({
      images,
      index: zoomIndex,
      origin: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    });
  };

  const offset = -(index * step) + drag;

  if (images.length === 0) return null;

  return (
    <div className={styles.carousel}>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          goTo(index - 1);
        }}
        disabled={index <= 0}
        aria-label="Previous pictures"
      >
        ‹
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowRight}`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          goTo(index + 1);
        }}
        disabled={index >= maxIndex}
        aria-label="Next pictures"
      >
        ›
      </button>

      <div
        ref={viewportRef}
        className={`${styles.carouselViewport} ${dragging ? styles.carouselDragging : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className={styles.carouselTrack}
          style={{
            transform: step ? `translate3d(${offset}px, 0, 0)` : undefined,
            transition: dragging ? "none" : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {images.map((src, imageIndex) => (
            <div key={src} className={styles.carouselSlide} data-zoom-index={imageIndex}>
              <Image
                src={src}
                alt={title}
                width={640}
                height={420}
                className={styles.galleryImg}
                draggable={false}
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkWindow() {
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  return (
    <div className={styles.workDocument}>
      <hr className={styles.topRule} />

      {workProjects.map((project, index) => (
        <section key={project.slug} className={styles.projectBlock}>
          {index > 0 && <hr className={styles.divider} />}

          <ProjectCarousel
            images={project.images ?? []}
            title={project.title}
            onZoom={setZoom}
          />

          <div className={styles.columns}>
            <div className={styles.colTitle}>
              <strong>{project.title}</strong>
            </div>
            <div className={styles.colMeta}>
              {project.subtitle}
              <br />
              {project.projectType}
              <br />
              {project.size}, {project.location}
              <br />
              <br />
              <i>{project.year}</i>
            </div>
            <div className={styles.colEssay}>
              {(project.essay || project.summary).split("\n\n").map((para) => (
                <p key={para.slice(0, 48)}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {zoom && (
        <ImageZoomOverlay
          images={zoom.images}
          index={zoom.index}
          origin={zoom.origin}
          onClose={() => setZoom(null)}
          onIndex={(dir) =>
            setZoom((current) => {
              if (!current) return current;
              const len = current.images.length;
              return { ...current, index: (current.index + dir + len) % len };
            })
          }
        />
      )}
    </div>
  );
}
