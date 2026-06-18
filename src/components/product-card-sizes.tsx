"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { addToCartQuickAction } from "@/app/actions";

type CardSize = { variantId: string; size: string; inStock: boolean };

export function ProductCardSizes({ sizes }: { sizes: CardSize[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function addToCart(variantId: string) {
    startTransition(async () => {
      const result = await addToCartQuickAction(variantId);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-black/90 p-3 text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-zinc-400">Размеры — клик добавит в корзину</p>
      <div className="grid grid-cols-5 gap-1.5">
        {sizes.map((item) => (
          <button
            key={item.size}
            type="button"
            disabled={!item.inStock || pending}
            onClick={() => addToCart(item.variantId)}
            aria-label={`Добавить размер ${item.size} в корзину`}
            className={`border px-1.5 py-1 text-center text-xs font-bold transition-colors duration-150 ${
              item.inStock
                ? "border-white hover:bg-[var(--accent)] hover:text-black disabled:opacity-60"
                : "cursor-not-allowed border-zinc-600 text-zinc-500 line-through"
            }`}
          >
            {item.size}
          </button>
        ))}
      </div>
    </div>
  );
}
