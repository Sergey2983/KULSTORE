import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteVariantAction } from "@/app/actions";
import { AdminProductForm } from "@/components/admin-product-form";
import { AdminProductImages } from "@/components/admin-product-images";
import { AdminProductSizes } from "@/components/admin-product-sizes";
import { Button } from "@/components/button";
import { VariantStockToggle } from "@/components/variant-stock-toggle";
import { shouldShowPostCreationControls } from "@/lib/admin-product";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_PRODUCT_IMAGES = 6;

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const showPostCreationControls = shouldShowPostCreationControls(Boolean(query.created));
  const [product, brands, categories, colors] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { include: { color: true }, orderBy: [{ size: "asc" }] },
      },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.color.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  // Decimal-поля Prisma нельзя передавать в клиентский компонент — приводим к строкам.
  const productForForm = {
    ...product,
    price: product.price.toString(),
    discountPrice: product.discountPrice ? product.discountPrice.toString() : null,
  };

  return (
    <div>
      <Link href="/admin/products" className="text-sm font-black uppercase underline-offset-4 hover:underline">
        ← Все товары
      </Link>
      <h1 className="mt-2 mb-8 text-4xl font-black">{product.title}</h1>
      {query.created ? (
        <p className="mb-6 border border-black bg-[var(--accent)] p-4 text-sm font-bold">
          Товар создан. Фото и размеры уже сохранены.
        </p>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="grid h-fit gap-6">
          <AdminProductForm product={productForForm} brands={brands} categories={categories} />
        </div>
        <div className="grid h-fit gap-6">
          <AdminProductImages
            productId={product.id}
            images={product.images}
            maxImages={MAX_PRODUCT_IMAGES}
            allowUpload={showPostCreationControls}
          />
          <div className="border border-black bg-white p-5">
            <h2 className="mb-3 text-2xl font-black">Размеры и цвета</h2>
            {product.variants.length ? (
              <div className="mb-4 grid gap-2">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="flex flex-wrap items-center justify-between gap-3 border border-black p-3">
                    <span className="font-black">
                      {variant.size} RU / {variant.color.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <VariantStockToggle variantId={variant.id} productId={product.id} inStock={variant.inStock} />
                      <form action={deleteVariantAction}>
                        <input type="hidden" name="id" value={variant.id} />
                        <Button variant="danger" className="px-2 py-1 text-xs">Удалить</Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-sm text-zinc-600">Размеров пока нет — добавьте хотя бы один, чтобы товар можно было купить.</p>
            )}
            <AdminProductSizes productId={product.id} colors={colors} allowAdd={showPostCreationControls} />
          </div>
        </div>
      </div>
    </div>
  );
}
