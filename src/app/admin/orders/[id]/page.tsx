import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteOrderAction, updateOrderStatusAction } from "@/app/actions";
import { Button } from "@/components/button";
import { ORDER_STATUS_LABELS, type AppOrderStatus } from "@/lib/order";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statuses = Object.keys(ORDER_STATUS_LABELS) as AppOrderStatus[];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      payment: true,
      items: { include: { product: true, variant: { include: { color: true } } } },
    },
  });
  if (!order) notFound();

  const itemsTotal = order.items.reduce(
    (sum, item) => sum + Number(item.priceAtPurchase) * item.quantity,
    0,
  );

  return (
    <div>
      <Link href="/admin/orders" className="text-sm font-black uppercase underline-offset-4 hover:underline">
        ← Все заказы
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black">{order.orderNumber}</h1>
          <p className="mt-2 text-xl font-black">
            {formatPrice(order.totalAmount)} / {ORDER_STATUS_LABELS[order.status as AppOrderStatus]}
          </p>
        </div>
        <form action={updateOrderStatusAction} className="flex items-end gap-2">
          <input type="hidden" name="id" value={order.id} />
          <label className="grid gap-1 text-xs font-black uppercase text-zinc-500">
            Статус заказа
            <select
              name="status"
              defaultValue={order.status}
              className="min-h-11 border border-black bg-white px-3 transition-colors duration-150 focus:border-[var(--accent)]"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <Button>Сменить</Button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-black bg-white p-5">
          <h2 className="mb-3 text-sm font-black uppercase text-zinc-500">Клиент</h2>
          <p className="font-black">{order.user.name ?? "Без имени"}</p>
          <p className="text-sm">{order.user.email}</p>
          {order.user.phone ? <p className="text-sm">{order.user.phone}</p> : null}
        </section>

        <section className="border border-black bg-white p-5">
          <h2 className="mb-3 text-sm font-black uppercase text-zinc-500">Доставка</h2>
          {order.address ? (
            <div className="text-sm leading-6">
              <p>
                {order.address.city}, {order.address.street}, д. {order.address.house}
                {order.address.apartment ? `, кв. ${order.address.apartment}` : ""}
              </p>
              <p>Индекс: {order.address.zipCode}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-600">Адрес доставки не указан</p>
          )}
        </section>

        <section className="border border-black bg-white p-5">
          <h2 className="mb-3 text-sm font-black uppercase text-zinc-500">Оплата</h2>
          {order.payment ? (
            <div className="text-sm leading-6">
              <p>Провайдер: {order.payment.provider}</p>
              <p>Статус: {order.payment.status}</p>
              <p>Сумма: {formatPrice(order.payment.amount)}</p>
              <p className="break-all text-zinc-500">ID: {order.payment.providerPaymentId}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-600">Платёж ещё не создан</p>
          )}
        </section>

        <section className="border border-black bg-white p-5">
          <h2 className="mb-3 text-sm font-black uppercase text-zinc-500">Даты</h2>
          <div className="text-sm leading-6">
            <p>Создан: {formatDate(order.createdAt)}</p>
            <p>Обновлён: {formatDate(order.updatedAt)}</p>
          </div>
        </section>
      </div>

      <section className="mt-6 border border-black bg-white p-5">
        <h2 className="mb-3 text-sm font-black uppercase text-zinc-500">Позиции ({order.items.length})</h2>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 border-t border-black py-3 first:border-t-0"
          >
            <div>
              <p className="font-black">{item.product.title}</p>
              <p className="text-sm">
                Размер {item.variant.size}, {item.variant.color.name}, x{item.quantity}
              </p>
            </div>
            <p className="font-black">
              {formatPrice(Number(item.priceAtPurchase) * item.quantity)}
              <span className="ml-2 text-sm font-normal text-zinc-500">
                ({formatPrice(item.priceAtPurchase)} × {item.quantity})
              </span>
            </p>
          </div>
        ))}
        <div className="mt-3 flex items-center justify-between border-t border-black pt-3">
          <span className="text-sm font-black uppercase text-zinc-500">Сумма позиций</span>
          <span className="font-black">{formatPrice(itemsTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase text-zinc-500">Итог заказа</span>
          <span className="text-2xl font-black">{formatPrice(order.totalAmount)}</span>
        </div>
      </section>

      <form action={deleteOrderAction} className="mt-6">
        <input type="hidden" name="id" value={order.id} />
        <Button variant="danger">Удалить заказ</Button>
      </form>
    </div>
  );
}
