"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CartAddedToast({ added }: { added: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!added) return;
    toast.success("Товар добавлен в корзину");
    router.replace("/cart");
  }, [added, router]);

  return null;
}
