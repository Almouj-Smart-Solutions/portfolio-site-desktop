"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./MacWindow.module.css";

export interface MacWindowProps {
  id: string;
  title: string;
  badge?: string;
  iconSrc?: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  toolbar?: React.ReactNode;
  footerRight?: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "about" | "cv" | "minimal" | "work";
}

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const RESIZE_HANDLES: ResizeHandle[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

const HANDLE_CLASS: Record<ResizeHandle, string> = {
  n: styles.resizeN,
  s: styles.resizeS,
  e: styles.resizeE,
  w: styles.resizeW,
  ne: styles.resizeNE,
  nw: styles.resizeNW,
  se: styles.resizeSE,
  sw: styles.resizeSW,
};

export default function MacWindow({
  id,
  title,
  badge,
  iconSrc,
  isOpen,
  isMinimized,
  isMaximized,
  isActive,
  zIndex,
  initialPosition = { x: 50, y: 70 },
  initialSize = { width: 920, height: 680 },
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  toolbar,
  footerRight,
  children,
  variant = "default",
}: MacWindowProps) {
  const isMinimalCard =
    variant === "about" || variant === "cv" || variant === "minimal" || variant === "work";
  const minWidth = isMinimalCard ? 320 : 420;
  const minHeight = isMinimalCard ? 240 : 300;
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({ width: initialSize.width, height: initialSize.height });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [userSized, setUserSized] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });
  const resizeStartRef = useRef({
    handle: "se" as ResizeHandle,
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      if (variant === "about") {
        const windowWidth = Math.min(initialSize.width, Math.max(360, window.innerWidth * 0.9));
        const windowHeight = Math.min(initialSize.height, Math.max(300, window.innerHeight - 110));
        const startX = Math.max(16, (window.innerWidth - windowWidth) / 2);
        const startY = Math.max(36, (window.innerHeight - windowHeight) / 2 - 20);
        setPosition({ x: startX, y: startY });
        setSize({ width: windowWidth, height: windowHeight });
        return;
      }

      if (variant === "work") {
        const windowWidth = Math.min(initialSize.width, Math.max(720, window.innerWidth * 0.82));
        const windowHeight = Math.max(460, window.innerHeight - 108);
        const startX = Math.max(16, (window.innerWidth - windowWidth) / 2);
        const startY = Math.max(24, (window.innerHeight - windowHeight) / 2 - 12);
        setPosition({ x: startX, y: startY });
        setSize({ width: windowWidth, height: windowHeight });
        return;
      }

      const windowWidth = Math.min(initialSize.width, window.innerWidth * 0.94);
      if (isMinimalCard) {
        const reservedFooter = 96;
        const windowHeight = Math.min(
          initialSize.height,
          Math.max(280, window.innerHeight - reservedFooter - 48)
        );
        const startX = Math.max(16, (window.innerWidth - windowWidth) / 2);
        const startY = Math.max(40, (window.innerHeight - reservedFooter - windowHeight) / 2);
        setPosition({ x: startX, y: startY });
        setSize({ width: windowWidth, height: windowHeight });
      } else {
        const windowHeight = Math.min(initialSize.height, window.innerHeight * 0.84);
        const startX = Math.max(16, (window.innerWidth - windowWidth) / 2 + (initialPosition.x - 50));
        const startY = Math.max(48, Math.min(initialPosition.y, window.innerHeight * 0.12));
        setPosition({ x: startX, y: startY });
        setSize({ width: windowWidth, height: windowHeight });
      }
    }
  }, [initialPosition.x, initialPosition.y, initialSize.height, initialSize.width, isMinimalCard, variant]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized || (typeof window !== "undefined" && window.innerWidth <= 768)) return;
    onFocus();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleResizeStart = useCallback(
    (handle: ResizeHandle) => (e: React.MouseEvent) => {
      if (isMaximized || (typeof window !== "undefined" && window.innerWidth <= 768)) return;
      e.preventDefault();
      e.stopPropagation();
      onFocus();
      setIsResizing(true);
      setUserSized(true);
      resizeStartRef.current = {
        handle,
        mouseX: e.clientX,
        mouseY: e.clientY,
        x: position.x,
        y: position.y,
        w: size.width,
        h: size.height,
      };
    },
    [isMaximized, onFocus, position.x, position.y, size.height, size.width]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isMaximized) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(0, Math.min(window.innerWidth - 120, dragStartRef.current.posX + dx));
      const newY = Math.max(20, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isMaximized]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const start = resizeStartRef.current;
      const dx = e.clientX - start.mouseX;
      const dy = e.clientY - start.mouseY;
      const handle = start.handle;
      const maxW = Math.max(minWidth, window.innerWidth - 16);
      const maxH = Math.max(minHeight, window.innerHeight - 36);

      let nextW = start.w;
      let nextH = start.h;

      if (handle.includes("e")) nextW = start.w + dx;
      if (handle.includes("s")) nextH = start.h + dy;
      if (handle.includes("w")) nextW = start.w - dx;
      if (handle.includes("n")) nextH = start.h - dy;

      nextW = Math.round(Math.max(minWidth, Math.min(maxW, nextW)));
      nextH = Math.round(Math.max(minHeight, Math.min(maxH, nextH)));

      let nextX = start.x;
      let nextY = start.y;
      if (handle.includes("w")) nextX = start.x + start.w - nextW;
      if (handle.includes("n")) nextY = start.y + start.h - nextH;

      nextX = Math.max(0, Math.min(window.innerWidth - 80, nextX));
      nextY = Math.max(20, Math.min(window.innerHeight - 60, nextY));

      setPosition({ x: nextX, y: nextY });
      setSize({ width: nextW, height: nextH });
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minHeight, minWidth]);

  const stopChromePointer = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCloseClick = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen || isMinimized) return null;

  return (
    <div
      data-mac-window={id}
      className={`${styles.windowWrapper} ${isMinimalCard ? styles.aboutWindow : ""} ${
        variant === "work" ? styles.workWindow : ""
      } ${isActive ? styles.windowActive : ""} ${isMaximized ? styles.windowMaximized : ""} ${
        isClosing ? styles.windowClosing : styles.windowOpening
      } ${isResizing ? styles.isResizing : ""}`}
      style={{
        zIndex,
        left: isMaximized ? undefined : `${position.x}px`,
        top: isMaximized ? undefined : `${position.y}px`,
        width: isMaximized ? undefined : `${size.width}px`,
        height: isMaximized
          ? undefined
          : variant === "about" && !userSized
            ? "auto"
            : `${size.height}px`,
        maxHeight: isMaximized || variant !== "about" || userSized
          ? undefined
          : "calc(100vh - 36px - 92px)",
      }}
      onMouseDown={onFocus}
    >
      {/* Titlebar */}
      <div
        className={`${styles.titlebar} ${isMinimalCard ? styles.aboutTitlebar : ""}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
        title="Double click to toggle Maximize"
      >
        {isMinimalCard ? (
          <>
            <div className={styles.aboutTrafficLights}>
              <button
                type="button"
                className={`${styles.aboutDot} ${styles.aboutCloseBtn}`}
                onMouseDown={stopChromePointer}
                onClick={handleCloseClick}
                aria-label="Close window"
                title="Close"
              >
                ●
              </button>
              <button
                type="button"
                className={`${styles.aboutDot} ${styles.aboutMinimizeBtn}`}
                onMouseDown={stopChromePointer}
                onClick={onMinimize}
                aria-label="Minimize window"
                title="Minimize"
              >
                ●
              </button>
              <button
                type="button"
                className={`${styles.aboutDot} ${styles.aboutMaximizeBtn}`}
                onMouseDown={stopChromePointer}
                onClick={onMaximize}
                aria-label="Maximize window"
                title="Toggle Zoom / Fullscreen"
              >
                ●
              </button>
            </div>
            <span className={styles.aboutWindowTitleText}>{title}</span>
          </>
        ) : (
          <>
            <div className={styles.trafficLights}>
              <button
                type="button"
                className={`${styles.trafficLight} ${styles.closeBtn}`}
                onMouseDown={stopChromePointer}
                onClick={handleCloseClick}
                aria-label="Close window"
                title="Close"
              >
                <span className={styles.btnSymbol}>✕</span>
              </button>
              <button
                type="button"
                className={`${styles.trafficLight} ${styles.minimizeBtn}`}
                onMouseDown={stopChromePointer}
                onClick={onMinimize}
                aria-label="Minimize window"
                title="Minimize"
              >
                <span className={styles.btnSymbol}>−</span>
              </button>
              <button
                type="button"
                className={`${styles.trafficLight} ${styles.maximizeBtn}`}
                onMouseDown={stopChromePointer}
                onClick={onMaximize}
                aria-label="Maximize window"
                title="Toggle Zoom / Fullscreen"
              >
                <span className={styles.btnSymbol}>{isMaximized ? "↘" : "⤢"}</span>
              </button>
            </div>
            <div className={styles.titleGroup}>
              {iconSrc && (
                <div className={styles.docProxyIcon}>
                  <Image src={iconSrc} alt="icon" width={16} height={16} />
                </div>
              )}
              <span className={styles.windowTitleText}>{title}</span>
              {badge && <span className={styles.windowBadge}>{badge}</span>}
            </div>
          </>
        )}

        {/* Right Toolbar Area */}
        {!isMinimalCard && <div className={styles.toolbarArea}>{toolbar}</div>}
      </div>

      {/* Main Body Content */}
      <div
        data-window-content
        className={`${styles.windowContent} ${isMinimalCard ? styles.aboutWindowContent : ""}`}
      >
        {children}
      </div>

      {/* Window Status Footer */}
      {!isMinimalCard && (
        <div className={styles.windowFooter}>
          <span className={styles.footerHintText}>
            Press <kbd className={styles.kbdKey}>Esc</kbd> to close &bull; <kbd className={styles.kbdKey}>⌘M</kbd> to minimize
          </span>
          {footerRight}
        </div>
      )}

      {!isMaximized &&
        RESIZE_HANDLES.map((handle) => (
          <div
            key={handle}
            className={`${styles.resizeHandle} ${HANDLE_CLASS[handle]}`}
            onMouseDown={handleResizeStart(handle)}
            role="separator"
            aria-label={`Resize window from ${handle} edge`}
          />
        ))}
    </div>
  );
}
