import { deleteHeroSlideAction } from "@/app/actions";
import { AdminHeroForm } from "@/components/admin-hero-form";
import { Button } from "@/components/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const slides = await prisma.heroSlide.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <p className="text-sm font-black uppercase text-zinc-500">Главная страница</p>
      <h1 className="mb-2 text-5xl font-black">Hero-слайдшоу</h1>
      <p className="mb-8 max-w-2xl text-sm text-zinc-600">
        Слайды на главной крутятся в том порядке, в котором вы их добавили. Количество слайдов не ограничено.
      </p>

      <section className="mb-10 min-w-0">
        <h2 className="mb-3 text-sm font-black uppercase text-zinc-500">Добавить слайд</h2>
        <AdminHeroForm />
      </section>

      <h2 className="mb-3 text-sm font-black uppercase text-zinc-500">Существующие слайды</h2>
      {slides.length ? (
        <div className="grid min-w-0 gap-6 md:grid-cols-2">
          {slides.map((slide) => (
            <div key={slide.id} className="grid min-w-0 gap-3">
              <AdminHeroForm slide={slide} />
              <form action={deleteHeroSlideAction}>
                <input type="hidden" name="id" value={slide.id} />
                <Button variant="danger">Удалить слайд</Button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="border border-black bg-white p-5 text-sm text-zinc-600">
          Слайдов пока нет — на главной странице показывается набор слайдов по умолчанию. Создайте хотя бы один
          слайд, чтобы управлять hero-баннером.
        </p>
      )}
    </div>
  );
}
