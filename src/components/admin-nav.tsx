"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/brands", label: "Бренды" },
  { href: "/admin/hero", label: "Hero-баннер" },
  { href: "/admin/orders", label: "Заказы" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid h-fit gap-1 border border-black bg-white p-3 md:sticky md:top-24">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`border px-3 py-2 text-sm font-black uppercase transition-colors duration-150 ${
              active ? "border-black bg-[var(--accent)]" : "border-transparent hover:border-black"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
