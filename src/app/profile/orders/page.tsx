import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { RecommendedProducts } from "@/components/recommended-products";
import { requireUser } from "@/lib/authz";
import { ORDER_STATUS_LABELS, type AppOrderStatus } from "@/lib/order";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { payment: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container-page py-10">
      <h1 className="mb-8 text-5xl font-black">Мои заказы</h1>
      {orders.length ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/profile/orders/${order.orderNumber}`}
              className="grid gap-2 border border-black bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#101010] md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-sm font-black uppercase text-zinc-500">{ORDER_STATUS_LABELS[order.status as AppOrderStatus]}</p>
                <h2 className="text-2xl font-black">{order.orderNumber}</h2>
                <p className="text-sm text-zinc-600">Позиций: {order.items.length}</p>
              </div>
              <p className="text-2xl font-black">{formatPrice(order.totalAmount)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="Заказов пока нет" actionHref="/catalog" actionLabel="Начать покупки" />
      )}
      <RecommendedProducts />
    </main>
  );
}
