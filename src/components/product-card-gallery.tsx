"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type GalleryImage = { url: string; alt?: string | null };

export function ProductCardGallery({
  images,
  title,
  href,
  children,
}: {
  images: GalleryImage[];
  title: string;
  href: string;
  children?: React.ReactNode;
}) {
  const list = images.length ? images : [{ url: "/products/placeholder.svg", alt: title }];
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (list.length < 2) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const next = Math.floor(ratio * list.length);
    setIndex(Math.max(0, Math.min(list.length - 1, next)));
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setIndex(0)}
      className="relative aspect-[4/3] overflow-hidden bg-zinc-100"
    >
      {list.map((image, i) => (
        <Image
          key={i}
          src={image.url}
          alt={image.alt ?? title}
          fill
          className={`object-cover transition-opacity duration-300 group-hover:scale-105 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ))}

      {list.length > 1 ? (
        <div className="absolute inset-x-0 top-0 z-20 flex gap-1 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {list.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      ) : null}

      <Link href={href} aria-label={title} className="absolute inset-0 z-[1]" />
      {children}
    </div>
  );
}
