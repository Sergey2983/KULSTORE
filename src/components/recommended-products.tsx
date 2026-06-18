import { ProductCard } from "./product-card";
import { prisma } from "@/lib/prisma";

const PRODUCT_INCLUDE = {
  brand: true,
  images: { orderBy: { position: "asc" as const }, take: 5 },
  variants: { select: { id: true, size: true, inStock: true } },
};

export async function RecommendedProducts({
  excludeIds,
  categoryId,
  take = 4,
}: {
  excludeIds?: string[];
  categoryId?: string;
  take?: number;
}) {
  const baseWhere = { isPublished: true, ...(excludeIds?.length ? { id: { notIn: excludeIds } } : {}) };

  let products = await prisma.product.findMany({
    where: categoryId ? { ...baseWhere, categoryId } : baseWhere,
    include: PRODUCT_INCLUDE,
    orderBy: [{ isRecommended: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take,
  });

  if (categoryId && products.length < take) {
    const more = await prisma.product.findMany({
      where: { ...baseWhere, id: { notIn: products.map((item) => item.id) } },
      include: PRODUCT_INCLUDE,
      orderBy: [{ isRecommended: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
      take: take - products.length,
    });
    products = [...products, ...more];
  }

  if (!products.length) return null;

  return (
    <section className="mt-14">
      <h2 className="mb-6 text-3xl font-black">Рекомендуем вам</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
