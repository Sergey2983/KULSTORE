import Image from "next/image";

import { saveDictionaryAction } from "@/app/actions";
import { Button } from "@/components/button";
import { ImageDropzone } from "@/components/image-dropzone";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-2 text-5xl font-black">Бренды</h1>
      <p className="mb-8 max-w-2xl text-sm text-zinc-600">
        Логотип бренда показывается в карусели на главной странице. Загрузите PNG/SVG с прозрачным фоном — он
        автоматически добавится в ленту. Чтобы обновить существующий бренд, укажите его slug ещё раз.
      </p>

      <form
        action={saveDictionaryAction}
        className="mb-8 grid gap-3 border border-black bg-white p-5"
      >
        <input type="hidden" name="type" value="brand" />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-black uppercase">
            Название
            <input
              name="name"
              placeholder="Nike"
              className="min-h-11 border border-black px-3 text-base font-normal normal-case transition-colors duration-150 focus:border-[var(--accent)]"
            />
          </label>
          <label className="grid gap-1 text-sm font-black uppercase">
            Slug
            <input
              name="slug"
              placeholder="nike"
              className="min-h-11 border border-black px-3 text-base font-normal normal-case transition-colors duration-150 focus:border-[var(--accent)]"
            />
          </label>
        </div>
        <ImageDropzone name="logoFile" label="Логотип бренда" helperText="PNG или SVG, прозрачный фон" />
        <Button>Сохранить бренд</Button>
      </form>

      <div className="grid gap-2">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="flex items-center justify-between gap-3 border border-black bg-white p-4 transition-colors duration-150 hover:bg-zinc-50"
          >
            <span className="font-bold">
              {brand.name} / {brand.slug}
            </span>
            {brand.logoUrl ? (
              <div className="relative h-8 w-20 shrink-0">
                <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain" sizes="80px" />
              </div>
            ) : (
              <span className="text-xs font-black uppercase text-zinc-400">Без логотипа</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
