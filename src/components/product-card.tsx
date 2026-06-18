import Link from "next/link";

import { formatPrice } from "@/lib/utils";
import { ProductCardGallery } from "./product-card-gallery";
import { ProductCardSizes } from "./product-card-sizes";

type ProductCardProps = {
  product: {
    title: string;
    slug: string;
    description?: string | null;
    price: string | number | { toString(): string };
    discountPrice?: string | number | { toString(): string } | null;
    brand?: { name: string };
    images?: { url: string; alt?: string | null }[];
    variants?: { id: string; size: string; inStock: boolean }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  // Dedupe by size, preferring an in-stock variant so the card adds a buyable item.
  const sizeMap = new Map<string, { variantId: string; size: string; inStock: boolean }>();
  for (const variant of product.variants ?? []) {
    const existing = sizeMap.get(variant.size);
    if (!existing || (!existing.inStock && variant.inStock)) {
      sizeMap.set(variant.size, { variantId: variant.id, size: variant.size, inStock: variant.inStock });
    }
  }
  const sizes = Array.from(sizeMap.values()).sort((a, b) => Number(a.size) - Number(b.size));

  return (
    <article className="group relative border border-black bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_#101010]">
      <ProductCardGallery images={product.images ?? []} title={product.title} href={`/product/${product.slug}`}>
        {sizes.length ? <ProductCardSizes sizes={sizes} /> : null}
      </ProductCardGallery>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-zinc-500">{product.brand?.name}</p>
            <h3 className="text-lg font-black leading-tight">
              <Link href={`/product/${product.slug}`} className="underline-offset-2 hover:underline">
                {product.title}
              </Link>
            </h3>
          </div>
          {product.discountPrice ? (
            <span className="bg-[var(--accent)] px-2 py-1 text-xs font-black">СКИДКА</span>
          ) : null}
        </div>
        {product.description ? (
          <p className="line-clamp-2 text-sm leading-5 text-zinc-600">{product.description}</p>
        ) : null}
        <div className="flex items-baseline gap-2">
          <span className="font-black">{formatPrice(product.discountPrice ?? product.price)}</span>
          {product.discountPrice ? <span className="text-sm text-zinc-500 line-through">{formatPrice(product.price)}</span> : null}
        </div>
      </div>
    </article>
  );
}
