"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";

const links = [
  { href: "/",      label: "Finder"       },
  { href: "/about", label: "About me.rtf" },
  { href: "/cv",    label: "cv.pdf"       },
  { href: "/work",  label: "Work Volume"  },
];

export default function Nav() {
  const pathname = usePathname();
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      setTimeString(now.toLocaleDateString("en-US", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className={styles.nav}>
      <div className={styles.leftGroup}>
        <Link href="/" className={styles.logo} title="Payman Tahghighi">
          <span className={styles.appleIcon}></span>
          <span>PT Studio</span>
        </Link>
        <ul className={styles.links}>
          {links.map(({ href, label }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.link} ${isActive ? styles.activeLink : ""}`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.rightGroup}>
        <div className={styles.statusItem}>
          <span className={styles.statusDot} />
          <span>SpaceScapeStudio (SSS)</span>
        </div>
        <span>•</span>
        <span>Shiraz, Iran</span>
        {timeString && (
          <>
            <span>•</span>
            <span>{timeString}</span>
          </>
        )}
      </div>
    </nav>
  );
}