import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [products, orders, paid] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalAmount: true } }),
  ]);

  return (
    <div>
      <p className="text-sm font-black uppercase text-zinc-500">Админ-панель</p>
      <h1 className="mb-8 text-5xl font-black">Управление KULSTORE</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Товаров" value={products} />
        <Metric label="Заказов" value={orders} />
        <Metric label="Выручка (оплачено)" value={formatPrice(paid._sum.totalAmount ?? 0)} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-black bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#101010]">
      <p className="text-sm font-black uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}
