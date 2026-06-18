import { ButtonLink } from "@/components/button";
import { ProductCard } from "@/components/product-card";
import { HeroSlideshow, type HeroSlide } from "@/components/hero-slideshow";
import { BrandMarquee } from "@/components/brand-marquee";
import { RecommendedProducts } from "@/components/recommended-products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SLIDES: HeroSlide[] = [
  {
    eyebrow: "Новая городская витрина",
    title: "KULSTORE. Обувь для твоего темпа.",
    subtitle: "Кроссовки, кеды и сезонная обувь с быстрым каталогом, честными остатками и оплатой картой онлайн.",
    image: "/products/lime-runner.svg",
    background: "radial-gradient(circle at 20% 20%, #1f2210 0%, #101010 55%, #050505 100%)",
    ctaHref: "/catalog",
    ctaLabel: "В каталог",
  },
  {
    eyebrow: "Спорт и стрит",
    title: "Nike, Adidas, Jordan, New Balance.",
    subtitle: "30+ брендов в одном каталоге: от спортивных дропов до редких коллабораций. Размеры от 35 до 51 RU.",
    image: "/products/mono-court.svg",
    background: "radial-gradient(circle at 80% 30%, #14213d 0%, #0b0f1a 60%, #050505 100%)",
    ctaHref: "/catalog?brand=nike",
    ctaLabel: "Смотреть Nike",
  },
  {
    eyebrow: "Люкс-линия",
    title: "Gucci, Balenciaga, Dior на твоей полке.",
    subtitle: "Люксовая обувь рядом со стритом: Prada, Burberry, Versace и Louis Vuitton уже в каталоге KULSTORE.",
    image: "/products/red-drop.svg",
    background: "radial-gradient(circle at 30% 70%, #2a1010 0%, #160808 55%, #050505 100%)",
    ctaHref: "/catalog?brand=gucci",
    ctaLabel: "Смотреть люкс",
  },
];

export default async function Home() {
  const [featured, brands, heroSlides] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      include: {
        brand: true,
        images: { orderBy: { position: "asc" }, take: 5 },
        variants: { select: { id: true, size: true, inStock: true } },
      },
      take: 6,
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, take: 30 }),
    prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } }),
  ]);

  const slides: HeroSlide[] = heroSlides.length ? heroSlides : SLIDES;

  return (
    <main>
      <HeroSlideshow slides={slides} />

      <BrandMarquee brands={brands} />

      <section className="container-page py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-zinc-500">Выбор редакции</p>
            <h2 className="text-4xl font-black">Хиты продаж</h2>
          </div>
          <ButtonLink href="/catalog" variant="ghost">
            Все товары
          </ButtonLink>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <RecommendedProducts excludeIds={featured.map((product) => product.id)} />
      </section>
    </main>
  );
}
