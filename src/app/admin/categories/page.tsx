import { saveDictionaryAction } from "@/app/actions";
import { Button } from "@/components/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-8 text-5xl font-black">Категории</h1>
      <form action={saveDictionaryAction} className="mb-6 grid gap-3 border border-black bg-white p-5 md:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="type" value="category" />
        <input name="name" placeholder="Название" className="min-h-11 border border-black px-3 transition-colors duration-150 focus:border-[var(--accent)]" />
        <input name="slug" placeholder="slug" className="min-h-11 border border-black px-3 transition-colors duration-150 focus:border-[var(--accent)]" />
        <Button>Сохранить</Button>
      </form>
      <div className="grid gap-2">
        {categories.map((item) => (
          <div key={item.id} className="border border-black bg-white p-4 font-bold transition-colors duration-150 hover:bg-zinc-50">
            {item.name} / {item.slug}
          </div>
        ))}
      </div>
    </div>
  );
}
