"use client";

import React, { useState, useRef, useEffect } from "react";
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
  variant?: "default" | "about" | "cv" | "minimal";
}

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
  const isMinimalCard = variant === "about" || variant === "cv" || variant === "minimal";
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      const windowWidth = Math.min(initialSize.width, window.innerWidth * 0.94);
      if (isMinimalCard) {
        const windowHeight = Math.min(initialSize.height, window.innerHeight * 0.88);
        const startX = Math.max(16, (window.innerWidth - windowWidth) / 2);
        const startY = Math.max(32, (window.innerHeight - windowHeight) / 2);
        setPosition({ x: startX, y: startY });
      } else {
        const startX = Math.max(16, (window.innerWidth - windowWidth) / 2 + (initialPosition.x - 50));
        const startY = Math.max(48, Math.min(initialPosition.y, window.innerHeight * 0.12));
        setPosition({ x: startX, y: startY });
      }
    }
  }, [initialPosition.x, initialPosition.y, initialSize.height, initialSize.width, isMinimalCard]);

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
      className={`${styles.windowWrapper} ${isMinimalCard ? styles.aboutWindow : ""} ${
        isActive ? styles.windowActive : ""
      } ${isMaximized ? styles.windowMaximized : ""} ${
        isClosing ? styles.windowClosing : styles.windowOpening
      }`}
      style={{
        zIndex,
        left: isMaximized ? undefined : `${position.x}px`,
        top: isMaximized ? undefined : `${position.y}px`,
        width: isMaximized ? undefined : `min(${initialSize.width}px, 94vw)`,
        height: isMaximized ? undefined : `min(${initialSize.height}px, ${isMinimalCard ? "88vh" : "84vh"})`,
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
        {/* Traffic Lights */}
        <div className={`${styles.trafficLights} ${isMinimalCard ? styles.aboutTrafficLights : ""}`}>
          <button
            type="button"
            className={`${styles.trafficLight} ${styles.closeBtn} ${isMinimalCard ? styles.aboutCloseBtn : ""}`}
            onClick={handleCloseClick}
            aria-label="Close window"
            title="Close"
          >
            <span className={styles.btnSymbol}>✕</span>
          </button>
          <button
            type="button"
            className={`${styles.trafficLight} ${styles.minimizeBtn} ${isMinimalCard ? styles.aboutMinimizeBtn : ""}`}
            onClick={onMinimize}
            aria-label="Minimize window"
            title="Minimize"
          >
            <span className={styles.btnSymbol}>−</span>
          </button>
          <button
            type="button"
            className={`${styles.trafficLight} ${styles.maximizeBtn} ${isMinimalCard ? styles.aboutMaximizeBtn : ""}`}
            onClick={onMaximize}
            aria-label="Maximize window"
            title="Toggle Zoom / Fullscreen"
          >
            <span className={styles.btnSymbol}>{isMaximized ? "↘" : "⤢"}</span>
          </button>
        </div>

        {/* Title Group */}
        <div className={`${styles.titleGroup} ${isMinimalCard ? styles.aboutTitleGroup : ""}`}>
          {!isMinimalCard && iconSrc && (
            <div className={styles.docProxyIcon}>
              <Image src={iconSrc} alt="icon" width={16} height={16} />
            </div>
          )}
          <span className={isMinimalCard ? styles.aboutWindowTitleText : styles.windowTitleText}>{title}</span>
          {!isMinimalCard && badge && <span className={styles.windowBadge}>{badge}</span>}
        </div>

        {/* Right Toolbar Area */}
        {!isMinimalCard && <div className={styles.toolbarArea}>{toolbar}</div>}
      </div>

      {/* Main Body Content */}
      <div className={`${styles.windowContent} ${isMinimalCard ? styles.aboutWindowContent : ""}`}>
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
    </div>
  );
}