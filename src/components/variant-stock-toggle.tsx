"use client";

import { toggleVariantStockAction } from "@/app/actions";

export function VariantStockToggle({
  variantId,
  productId,
  inStock,
}: {
  variantId: string;
  productId: string;
  inStock: boolean;
}) {
  return (
    <form action={toggleVariantStockAction}>
      <input type="hidden" name="id" value={variantId} />
      <input type="hidden" name="productId" value={productId} />
      <label className="flex items-center gap-1.5 text-xs font-black uppercase">
        <input
          type="checkbox"
          name="inStock"
          defaultChecked={inStock}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        В наличии
      </label>
    </form>
  );
}
