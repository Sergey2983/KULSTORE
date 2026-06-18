"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "./button";

export type HeroSlide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  background: string;
  ctaHref: string;
  ctaLabel: string;
};

function backgroundStyle(bg: string): React.CSSProperties {
  return bg.startsWith("/") || bg.startsWith("http")
    ? { backgroundImage: `url("${bg}")`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: bg };
}

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${y * -14}deg) rotateY(${x * 16}deg)`;
  }

  function resetTilt() {
    if (tiltRef.current) tiltRef.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }

  return (
    <section className="relative h-screen overflow-hidden border-b border-black text-white">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0, ...backgroundStyle(slide.background) }}
        >
          <div className="absolute inset-0 bg-black/35" />
        </div>
      ))}

      <div className="container-page relative z-10 flex h-full items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div key={index} className="space-y-7">
            {slides[index].eyebrow ? (
              <div className="animate-hero-rise inline-flex items-center gap-2 border border-white/40 bg-white/10 px-3 py-2 text-xs font-black uppercase backdrop-blur">
                {slides[index].eyebrow}
              </div>
            ) : null}
            <h1 className="animate-hero-rise max-w-3xl text-6xl font-black leading-[0.92] tracking-tight md:text-8xl" style={{ animationDelay: "80ms" }}>
              {slides[index].title}
            </h1>
            <p className="animate-hero-rise max-w-xl text-lg leading-8 text-zinc-200" style={{ animationDelay: "160ms" }}>
              {slides[index].subtitle}
            </p>
            <div className="animate-hero-rise flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <ButtonLink href={slides[index].ctaHref} variant="secondary">
                {slides[index].ctaLabel} <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="/catalog" variant="ghost" className="border-white/60 text-white hover:bg-white/10">
                Смотреть каталог
              </ButtonLink>
            </div>
          </div>

          <div
            ref={tiltRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
            className="animate-float-3d relative hidden aspect-square w-full max-w-[460px] place-self-end transition-transform duration-200 ease-out lg:grid"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="street-shadow relative h-full w-full border border-white/20 bg-white/95 p-6" style={{ transform: "translateZ(20px)" }}>
              <Image
                src={slides[index].image}
                alt={slides[index].title}
                fill
                className="object-contain p-10"
                sizes="(max-width: 1024px) 0px, 40vw"
                priority={index === 0}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label="Перейти к слайду"
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-[var(--accent)]" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
