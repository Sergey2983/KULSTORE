import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "../../../../auth";
import { ButtonLink } from "@/components/button";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchaseForm } from "@/components/product-purchase-form";
import { ProductInfoAccordion } from "@/components/product-info-accordion";
import { SizeChartModal } from "@/components/size-chart-modal";
import { RecommendedProducts } from "@/components/recommended-products";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const GENDER_LABELS: Record<string, string> = {
  MALE: "Мужской",
  FEMALE: "Женский",
  UNISEX: "Унисекс",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { title: true, description: true } });
  return {
    title: product ? `${product.title} — KULSTORE` : "Товар не найден — KULSTORE",
    description: product?.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: { include: { color: true }, orderBy: [{ size: "asc" }] },
      },
    }),
    auth(),
  ]);

  if (!product || !product.isPublished) notFound();

  const colors = Array.from(new Set(product.variants.map((variant) => variant.color.name)));
  const specs = [
    { label: "Модель", value: product.title },
    { label: "Пол", value: GENDER_LABELS[product.gender] ?? product.gender },
    { label: "Цвета", value: colors.length ? colors.join(", ") : "—" },
    { label: "Страна", value: product.countryOfOrigin ?? "—" },
    { label: "Состав", value: product.material ?? "—" },
  ];

  return (
    <main className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={product.images} title={product.title} />
        <section className="h-fit border border-black bg-white p-6 street-shadow">
          <p className="text-sm font-black uppercase text-zinc-500">{product.brand.name} / {product.category.name}</p>
          <h1 className="mt-2 text-4xl font-black leading-none sm:text-5xl">{product.title}</h1>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-black">{formatPrice(product.discountPrice ?? product.price)}</span>
            {product.discountPrice ? <span className="text-lg text-zinc-500 line-through">{formatPrice(product.price)}</span> : null}
          </div>
          <p className="mt-6 leading-7 text-zinc-700">{product.description}</p>
          <div className="mt-6">
            <SizeChartModal />
          </div>
          <div className="mt-8">
            {session?.user ? (
              <ProductPurchaseForm variants={product.variants} canBuy />
            ) : (
              <div className="grid gap-3">
                <ButtonLink href={`/login?callbackUrl=/product/${product.slug}`} variant="secondary">
                  Войти, чтобы купить
                </ButtonLink>
                <p className="text-sm text-zinc-600">Каталог открыт всем, покупка доступна после регистрации.</p>
              </div>
            )}
          </div>
          <ProductInfoAccordion specs={specs} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: product.title,
                brand: product.brand.name,
                offers: {
                  "@type": "Offer",
                  priceCurrency: "RUB",
                  price: Number((product.discountPrice ?? product.price).toString()),
                  availability: product.variants.some((variant) => variant.inStock)
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                },
              }),
            }}
          />
          <Link href="/catalog" className="mt-6 inline-block text-sm font-black uppercase underline">Назад в каталог</Link>
        </section>
      </div>

      <RecommendedProducts excludeIds={[product.id]} categoryId={product.categoryId} />
    </main>
  );
}
