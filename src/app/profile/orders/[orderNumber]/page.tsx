import { notFound } from "next/navigation";

import { RecommendedProducts } from "@/components/recommended-products";
import { requireUser } from "@/lib/authz";
import { ORDER_STATUS_LABELS, type AppOrderStatus } from "@/lib/order";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const user = await requireUser();
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      payment: true,
      address: true,
      items: { include: { product: true, variant: { include: { color: true } } } },
    },
  });

  if (!order || order.userId !== user.id) notFound();

  return (
    <main className="container-page py-10">
      <section className="border border-black bg-white p-6">
        <p className="text-sm font-black uppercase text-zinc-500">{ORDER_STATUS_LABELS[order.status as AppOrderStatus]}</p>
        <h1 className="text-5xl font-black">{order.orderNumber}</h1>
        <p className="mt-3 text-2xl font-black">{formatPrice(order.totalAmount)}</p>
        <div className="mt-8 grid gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="border-t border-black py-3">
              <p className="font-black">{item.product.title}</p>
              <p className="text-sm text-zinc-600">Размер {item.variant.size}, цвет {item.variant.color.name}, количество {item.quantity}</p>
            </div>
          ))}
        </div>
      </section>
      <RecommendedProducts />
    </main>
  );
}
