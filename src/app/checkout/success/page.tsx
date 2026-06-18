import { ButtonLink } from "@/components/button";
import { RecommendedProducts } from "@/components/recommended-products";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;

  return (
    <main className="container-page py-12">
      <section className="mx-auto max-w-xl border border-black bg-white p-8 text-center street-shadow">
        <p className="text-sm font-black uppercase text-zinc-500">Оплата</p>
        <h1 className="mt-2 text-4xl font-black">Заказ принят</h1>
        <p className="mt-4 text-zinc-700">
          Если платёж уже подтверждён, заказ будет отмечен как оплаченный. Номер заказа: {order ?? "не указан"}.
        </p>
        <ButtonLink href="/profile/orders" className="mt-6" variant="secondary">
          Мои заказы
        </ButtonLink>
      </section>
      <RecommendedProducts />
    </main>
  );
}
