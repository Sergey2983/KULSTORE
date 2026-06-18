import { ButtonLink } from "@/components/button";
import { RecommendedProducts } from "@/components/recommended-products";
import { requireUser } from "@/lib/authz";

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <main className="container-page py-10">
      <section className="border border-black bg-white p-6 street-shadow">
        <p className="text-sm font-black uppercase text-zinc-500">Профиль</p>
        <h1 className="mt-2 text-5xl font-black">{user.name ?? "Покупатель KULSTORE"}</h1>
        <p className="mt-3 text-zinc-700">{user.email}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/profile/orders" variant="secondary">История заказов</ButtonLink>
          <ButtonLink href="/profile/notifications" variant="ghost">Уведомления</ButtonLink>
          <ButtonLink href="/catalog" variant="ghost">В каталог</ButtonLink>
        </div>
      </section>
      <RecommendedProducts />
    </main>
  );
}
