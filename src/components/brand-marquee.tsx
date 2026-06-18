import Image from "next/image";

type MarqueeBrand = {
  id: string;
  name: string;
  logoUrl: string | null;
};

function BrandItem({ brand }: { brand: MarqueeBrand }) {
  if (brand.logoUrl) {
    return (
      <div className="relative mr-12 h-10 w-28 shrink-0 opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0">
        <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain" sizes="112px" />
      </div>
    );
  }
  return (
    <span className="mr-12 shrink-0 whitespace-nowrap text-sm font-black uppercase tracking-wide text-zinc-500 transition hover:text-black">
      {brand.name}
    </span>
  );
}

export function BrandMarquee({ brands }: { brands: MarqueeBrand[] }) {
  if (!brands.length) return null;

  // Дублируем список, чтобы лента прокручивалась бесшовно (translateX -50%).
  const loop = [...brands, ...brands];

  return (
    <section className="border-b border-black bg-white py-6">
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
          {loop.map((brand, i) => (
            <BrandItem key={`${brand.id}-${i}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
