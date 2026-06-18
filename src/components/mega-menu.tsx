"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Category = { name: string; slug: string };
type Brand = { name: string; slug: string; tier: "SPORT" | "LUXURY" };

export function CatalogMegaMenu({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sport = brands.filter((brand) => brand.tier === "SPORT");
  const luxury = brands.filter((brand) => brand.tier === "LUXURY");

  function show() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function hide() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <Link href="/catalog" className="inline-flex items-center gap-1">
        Каталог
      </Link>
      {open ? (
        <div className="animate-fade-in fixed inset-x-0 top-16 z-50 border-b border-t border-black bg-white text-left normal-case shadow-[0_16px_24px_rgba(16,16,16,0.12)]">
          <div className="container-page grid grid-cols-[0.8fr_1fr_1.4fr_1.4fr] gap-8 py-8">
            <div>
              <p className="mb-3 text-xs font-black uppercase text-zinc-500">Пол</p>
              <div className="grid gap-2 text-sm font-bold">
                <Link href="/catalog?gender=MALE" className="transition-colors duration-150 hover:underline">
                  Мужчины
                </Link>
                <Link href="/catalog?gender=FEMALE" className="transition-colors duration-150 hover:underline">
                  Женщины
                </Link>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-black uppercase text-zinc-500">Категории</p>
              <div className="grid gap-2 text-sm font-bold">
                {categories.map((category) => (
                  <Link key={category.slug} href={`/catalog?category=${category.slug}`} className="transition-colors duration-150 hover:underline">
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-black uppercase text-zinc-500">Спорт и стрит</p>
              <div className="grid grid-cols-2 gap-2 text-sm font-bold">
                {sport.map((brand) => (
                  <Link key={brand.slug} href={`/catalog?brand=${brand.slug}`} className="transition-colors duration-150 hover:underline">
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-black uppercase text-zinc-500">Люкс</p>
              <div className="grid grid-cols-2 gap-2 text-sm font-bold">
                {luxury.map((brand) => (
                  <Link key={brand.slug} href={`/catalog?brand=${brand.slug}`} className="transition-colors duration-150 hover:underline">
                    {brand.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/catalog"
                className="mt-5 inline-block border border-black bg-[var(--accent)] px-3 py-2 text-xs font-black uppercase transition-colors duration-150 hover:bg-lime-200"
              >
                Весь каталог →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
