import Image from "next/image";

import { EmptyState } from "@/components/empty-state";
import { ButtonLink } from "@/components/button";
import { CartAddedToast } from "@/components/cart-added-toast";
import { CartQuantity } from "@/components/cart-quantity";
import { RecommendedProducts } from "@/components/recommended-products";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getEffectivePrice } from "@/lib/order";

export const dynamic = "force-dynamic";

type CartPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const params = await searchParams;
  const justAdded = params.added === "1";
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
        <EmptyState title="Корзина пуста" actionHref="/catalog" actionLabel="Выбрать пару" />
        <RecommendedProducts />
      </main>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + getEffectivePrice(item.variant.product) * item.quantity, 0);

  return (
    <main className="container-page py-10">
      <CartAddedToast added={justAdded} />
      <h1 className="mb-8 text-5xl font-black">Корзина</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="grid gap-4">
          {cart.items.map((item, index) => (
            <div
              key={item.id}
              className="animate-hero-rise grid grid-cols-[88px_1fr_auto] items-center gap-4 border border-black bg-white p-4 transition-shadow duration-200 hover:shadow-[6px_6px_0_#101010] md:grid-cols-[96px_1fr_auto]"
              style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
            >
              <div className="relative aspect-square w-full overflow-hidden border border-black bg-zinc-100">
                <Image
                  src={item.variant.product.images[0]?.url ?? "/products/placeholder.svg"}
                  alt={item.variant.product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-zinc-500">{item.variant.product.brand.name}</p>
                <h2 className="text-2xl font-black">{item.variant.product.title}</h2>
                <p className="text-sm">Размер {item.variant.size}, цвет {item.variant.color.name}</p>
                <p className="mt-2 font-black">{formatPrice(getEffectivePrice(item.variant.product))}</p>
              </div>
              <CartQuantity itemId={item.id} quantity={item.quantity} />
            </div>
          ))}
        </section>
        <aside className="h-fit border border-black bg-white p-5 street-shadow">
          <p className="text-sm font-black uppercase text-zinc-500">Итого</p>
          <p className="mt-2 text-4xl font-black">{formatPrice(total)}</p>
          <div className="mt-5 border-t border-black pt-4 text-sm leading-6 text-zinc-700">
            <p className="font-black text-black">Способы оплаты</p>
            <p className="mt-2">
              Оплата картой онлайн: МИР, Visa, Mastercard, SberPay и QR. Платёж проходит на защищённой странице, данные
              карты не сохраняются в магазине.
            </p>
          </div>
          <ButtonLink href="/checkout" variant="secondary" className="mt-6 w-full">
            Оформить заказ
          </ButtonLink>
        </aside>
      </div>
      <RecommendedProducts />
    </main>
  );
}
