"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/cv", label: "CV" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/footer", label: "Footer" },
  { href: "/admin/site", label: "Site" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav">
      {links.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className={active ? "active" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
