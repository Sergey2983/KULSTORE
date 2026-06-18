import Image from "next/image";

import { CheckoutForm } from "@/components/checkout-form";
import { EmptyState } from "@/components/empty-state";
import { RecommendedProducts } from "@/components/recommended-products";
import { requireUser } from "@/lib/authz";
import { getEffectivePrice } from "@/lib/order";
import { calculateCheckoutTotals, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/payments/totals";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireUser();
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          variant: {
            include: { color: true, product: { include: { brand: true, images: { orderBy: { position: "asc" }, take: 1 } } } },
          },
        },
      },
    },
  });

  if (!cart?.items.length) {
    return (
      <main className="container-page py-10">
        <EmptyState title="Для оформления заказа добавьте товары" actionHref="/catalog" actionLabel="В каталог" />
        <RecommendedProducts />
      </main>
    );
  }

  const totals = calculateCheckoutTotals(
    cart.items.map((item) => ({
      price: getEffectivePrice(item.variant.product),
      quantity: item.quantity,
    })),
  );

  return (
    <main className="container-page py-10">
      <h1 className="mb-8 text-5xl font-black">Оформление заказа</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-6">
          <CheckoutForm />
          <div className="border border-black bg-white p-5 transition-shadow duration-200 hover:shadow-[6px_6px_0_#101010]">
            <p className="mb-3 text-sm font-black uppercase text-zinc-500">Доставка</p>
            <ul className="grid gap-2 text-sm leading-6 text-zinc-700">
              <li>
                Курьером по России - 3-7 дней, {DELIVERY_FEE} ₽ (бесплатно от {formatPrice(FREE_DELIVERY_THRESHOLD)})
              </li>
              <li>Самовывоз из пунктов выдачи - 1-3 дня, бесплатно</li>
              <li>После оплаты номер для отслеживания появится в личном кабинете.</li>
            </ul>
          </div>
        </div>
        <aside className="grid h-fit gap-5">
          <div className="border border-black bg-white p-5 transition-shadow duration-200 hover:shadow-[6px_6px_0_#101010]">
            <p className="mb-3 text-sm font-black uppercase text-zinc-500">Товары к оплате</p>
            <div className="grid gap-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative aspect-square h-14 w-14 shrink-0 overflow-hidden border border-black bg-zinc-100">
                    <Image
                      src={item.variant.product.images[0]?.url ?? "/products/placeholder.svg"}
                      alt={item.variant.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black leading-tight">{item.variant.product.title}</p>
                    <p className="text-xs text-zinc-500">
                      Размер {item.variant.size}, {item.variant.color.name} x {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-black">{formatPrice(getEffectivePrice(item.variant.product) * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-1 border-t border-black pt-4 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Товары</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Доставка</span>
                <span>{totals.deliveryFee ? formatPrice(totals.deliveryFee) : "Бесплатно"}</span>
              </div>
            </div>
            <p className="mt-3 text-sm font-black uppercase text-zinc-500">К оплате</p>
            <p className="text-4xl font-black">{formatPrice(totals.total)}</p>
            <p className="mt-4 text-sm text-zinc-600">
              После подтверждения заказа откроется безопасная страница оплаты картой: МИР, Visa, Mastercard, SberPay и QR.
            </p>
          </div>
        </aside>
      </div>
      <RecommendedProducts />
    </main>
  );
}
