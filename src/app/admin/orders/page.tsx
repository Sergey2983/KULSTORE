import Link from "next/link";

import { updateOrderStatusAction } from "@/app/actions";
import { Button } from "@/components/button";
import { ORDER_STATUS_LABELS, type AppOrderStatus } from "@/lib/order";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statuses = Object.keys(ORDER_STATUS_LABELS) as AppOrderStatus[];

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true } }, payment: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-8 text-5xl font-black">Заказы</h1>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="grid gap-4 border border-black bg-white p-5 transition-shadow duration-200 hover:shadow-[6px_6px_0_#101010] lg:grid-cols-[1fr_auto] lg:items-center"
          >
            <div>
              <p className="text-sm font-black uppercase text-zinc-500">{order.user.email}</p>
              <Link href={`/admin/orders/${order.id}`} className="text-2xl font-black underline-offset-4 hover:underline">
                {order.orderNumber}
              </Link>
              <p className="text-sm font-black uppercase text-zinc-500">{ORDER_STATUS_LABELS[order.status as AppOrderStatus]}</p>
              <p>{formatPrice(order.totalAmount)} / {order.items.length} поз.</p>
            </div>
            <form action={updateOrderStatusAction} className="flex items-end gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="min-h-11 border border-black bg-white px-3 transition-colors duration-150 focus:border-[var(--accent)]">
                {statuses.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}
              </select>
              <Button>Сменить</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
