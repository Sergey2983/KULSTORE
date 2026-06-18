"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

import { updateCartItemAction } from "@/app/actions";

export function CartQuantity({ itemId, quantity }: { itemId: string; quantity: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateCartItemAction} className="flex items-center justify-end gap-2">
      <input type="hidden" name="itemId" value={itemId} />
      <label className="grid gap-1 text-xs font-black uppercase text-zinc-500">
        Кол-во
        <input
          className="h-11 w-20 border border-black px-3 text-base font-bold transition-colors duration-150 focus:border-[var(--accent)]"
          name="quantity"
          type="number"
          min={0}
          defaultValue={quantity}
          onChange={() => formRef.current?.requestSubmit()}
        />
      </label>
      <PendingIndicator />
    </form>
  );
}

function PendingIndicator() {
  const { pending } = useFormStatus();
  return pending ? <span className="text-xs font-black uppercase text-zinc-500">Сохраняем…</span> : null;
}
