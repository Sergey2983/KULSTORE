"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "./button";
import { addToCartAction } from "@/app/actions";

type Variant = {
  id: string;
  size: string;
  inStock: boolean;
  color: { name: string; hex: string };
};

export function ProductPurchaseForm({ variants, canBuy }: { variants: Variant[]; canBuy: boolean }) {
  const colors = useMemo(
    () => Array.from(new Map(variants.map((variant) => [variant.color.name, variant.color])).values()),
    [variants],
  );
  const [colorName, setColorName] = useState(colors[0]?.name);
  const sizesForColor = useMemo(
    () => variants.filter((variant) => variant.color.name === colorName).sort((a, b) => Number(a.size) - Number(b.size)),
    [variants, colorName],
  );
  const [variantId, setVariantId] = useState(sizesForColor.find((v) => v.inStock)?.id ?? sizesForColor[0]?.id);

  const selectColor = (name: string) => {
    setColorName(name);
    const next = variants.filter((variant) => variant.color.name === name).sort((a, b) => Number(a.size) - Number(b.size));
    setVariantId(next.find((v) => v.inStock)?.id ?? next[0]?.id);
  };

  return (
    <form action={addToCartAction} className="grid gap-5">
      <input type="hidden" name="variantId" value={variantId ?? ""} />
      {colors.length > 1 ? (
        <div>
          <p className="mb-2 text-sm font-black uppercase">Цвет: {colorName}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => selectColor(color.name)}
                title={color.name}
                aria-pressed={color.name === colorName}
                className={`h-9 w-9 rounded-full border-2 transition duration-150 hover:scale-110 ${
                  color.name === colorName ? "border-black ring-2 ring-[var(--accent)]" : "border-zinc-300"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      ) : null}
      <div>
        <p className="mb-2 text-sm font-black uppercase">Размер (RU)</p>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {sizesForColor.map((variant) => (
            <button
              key={variant.id}
              type="button"
              disabled={!variant.inStock}
              onClick={() => setVariantId(variant.id)}
              aria-pressed={variant.id === variantId}
              className={`flex h-11 items-center justify-center border border-black text-sm font-black transition duration-150 ${
                variant.id === variantId
                  ? "bg-[var(--accent)]"
                  : variant.inStock
                    ? "bg-white hover:bg-zinc-100"
                    : "cursor-not-allowed border-zinc-300 bg-zinc-100 text-zinc-400 line-through"
              }`}
            >
              {variant.size}
            </button>
          ))}
        </div>
      </div>
      <label className="grid gap-2 text-sm font-black uppercase">
        Количество
        <input
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
          className="min-h-12 border border-black bg-white px-3 transition-colors duration-150 focus:border-[var(--accent)]"
        />
      </label>
      <AddToCartButton canBuy={canBuy} hasVariant={!!variantId} />
    </form>
  );
}

function AddToCartButton({ canBuy, hasVariant }: { canBuy: boolean; hasVariant: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={!canBuy || !hasVariant || pending}
      variant="secondary"
      className={pending ? "animate-cart-pulse" : ""}
    >
      {!canBuy ? "Войдите, чтобы купить" : pending ? "Добавляем…" : "Добавить в корзину"}
    </Button>
  );
}
