"use client";

import { useState } from "react";

import { addProductSizesAction } from "@/app/actions";
import { Button } from "./button";
import { SIZE_OPTIONS } from "@/lib/sizes";

export function AdminProductSizes({
  productId,
  colors,
  allowAdd = true,
}: {
  productId: string;
  colors: { id: string; name: string }[];
  allowAdd?: boolean;
}) {
  const [colorId, setColorId] = useState(colors[0]?.id ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(size: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }

  if (!allowAdd) return null;

  return (
    <form action={addProductSizesAction} className="grid gap-3 border border-black bg-white p-5">
      <h2 className="text-xl font-black">Добавить размеры</h2>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="colorId" value={colorId} />
      {[...selected].map((size) => (
        <input key={size} type="hidden" name="sizes" value={size} />
      ))}

      <label className="grid gap-1 text-sm font-black uppercase">
        Цвет
        <select
          value={colorId}
          onChange={(event) => setColorId(event.target.value)}
          className="min-h-11 border border-black bg-white px-3 transition-colors duration-150 focus:border-[var(--accent)]"
        >
          {colors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <p className="mb-2 text-sm font-black uppercase">Размеры (RU) — выберите нужные</p>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {SIZE_OPTIONS.map((size) => {
            const active = selected.has(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggle(size)}
                aria-pressed={active}
                className={`flex h-11 items-center justify-center border text-sm font-black transition duration-150 ${
                  active ? "border-black bg-[var(--accent)]" : "border-zinc-300 bg-white hover:border-black"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-black uppercase">
        <input type="checkbox" name="inStock" defaultChecked className="h-5 w-5 accent-[var(--accent)]" />
        В наличии
      </label>

      <Button variant="secondary" disabled={!selected.size || !colorId}>
        {selected.size ? `Добавить размеры (${selected.size})` : "Выберите размеры"}
      </Button>
    </form>
  );
}
