import { ButtonLink } from "@/components/button";
import { RecommendedProducts } from "@/components/recommended-products";

export default async function CheckoutFailPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;

  return (
    <main className="container-page py-12">
      <section className="mx-auto max-w-xl border border-black bg-white p-8 text-center street-shadow">
        <p className="text-sm font-black uppercase text-zinc-500">Оплата</p>
        <h1 className="mt-2 text-4xl font-black">Оплата не завершена</h1>
        <p className="mt-4 text-zinc-700">
          {order ? `Заказ ${order} остался без успешной оплаты.` : "Заказ остался без успешной оплаты."} Можно оформить
          покупку заново или выбрать другую пару.
        </p>
        <ButtonLink href="/cart" className="mt-6" variant="secondary">
          Вернуться в корзину
        </ButtonLink>
      </section>
      <RecommendedProducts />
    </main>
  );
}
