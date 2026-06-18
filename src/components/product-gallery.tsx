"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GalleryImage = { id: string; url: string; alt?: string | null };

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const gallery = images.length ? images : [{ id: "placeholder", url: "/products/placeholder.svg", alt: title }];
  const [active, setActive] = useState(0);

  const go = (delta: number) => setActive((current) => (current + delta + gallery.length) % gallery.length);

  return (
    <section className="grid gap-4">
      <div className="group relative aspect-square border border-black bg-white sm:aspect-[4/3]">
        <Image
          key={gallery[active].id}
          src={gallery[active].url}
          alt={gallery[active].alt ?? title}
          fill
          className="animate-hero-fade object-contain p-6"
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority
        />
        {gallery.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Предыдущее изображение"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-black bg-white/90 transition hover:bg-black hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следующее изображение"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-black bg-white/90 transition hover:bg-black hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </>
        ) : null}
      </div>
      {gallery.length > 1 ? (
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {gallery.slice(0, 6).map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Изображение ${index + 1}`}
              className={`relative aspect-square border bg-white transition ${
                index === active ? "border-black ring-2 ring-black" : "border-zinc-300 hover:border-black"
              }`}
            >
              <Image src={image.url} alt={image.alt ?? title} fill className="object-contain p-1.5" sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
