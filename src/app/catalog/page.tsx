import Link from "next/link";
import { Prisma, Gender } from "@prisma/client";
import { Search } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { RecommendedProducts } from "@/components/recommended-products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CatalogProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const MIN_SIZE = 35;
const MAX_SIZE = 51;
const ALL_SIZES = Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, i) => String(MIN_SIZE + i));

function listParam(value: string | string[] | undefined) {
  if (!value) return [];
  return (Array.isArray(value) ? value.join(",") : value).split(",").filter(Boolean);
}

function toggled(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

type FilterState = {
  category?: string;
  brand: string[];
  size: string[];
  color: string[];
  gender?: string;
  sort: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
};

function buildHref(state: FilterState) {
  const sp = new URLSearchParams();
  if (state.category) sp.set("category", state.category);
  if (state.brand.length) sp.set("brand", state.brand.join(","));
  if (state.size.length) sp.set("size", state.size.join(","));
  if (state.color.length) sp.set("color", state.color.join(","));
  if (state.gender) sp.set("gender", state.gender);
  if (state.sort && state.sort !== "new") sp.set("sort", state.sort);
  if (state.minPrice) sp.set("minPrice", String(state.minPrice));
  if (state.maxPrice) sp.set("maxPrice", String(state.maxPrice));
  if (state.q) sp.set("q", state.q);
  const qs = sp.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

const GENDER_OPTIONS = [
  { value: "MALE", label: "Мужчины" },
  { value: "FEMALE", label: "Женщины" },
  { value: "UNISEX", label: "Унисекс" },
];

export default async function CatalogPage({ searchParams }: CatalogProps) {
  const params = await searchParams;
  const state: FilterState = {
    category: typeof params.category === "string" ? params.category : undefined,
    brand: listParam(params.brand),
    size: listParam(params.size),
    color: listParam(params.color),
    gender: typeof params.gender === "string" ? params.gender : undefined,
    sort: typeof params.sort === "string" ? params.sort : "new",
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    q: typeof params.q === "string" ? params.q.trim() : undefined,
  };

  const conditions: Prisma.ProductWhereInput[] = [];
  if (state.category) conditions.push({ category: { slug: state.category } });
  if (state.brand.length) conditions.push({ brand: { slug: { in: state.brand } } });
  if (state.gender) conditions.push({ gender: state.gender as Gender });
  if (state.minPrice) conditions.push({ price: { gte: state.minPrice } });
  if (state.maxPrice) conditions.push({ price: { lte: state.maxPrice } });
  if (state.size.length || state.color.length) {
    conditions.push({
      variants: {
        some: {
          ...(state.size.length ? { size: { in: state.size } } : {}),
          ...(state.color.length ? { color: { name: { in: state.color } } } : {}),
          inStock: true,
        },
      },
    });
  }
  if (state.q) {
    conditions.push({
      OR: [
        { title: { contains: state.q, mode: "insensitive" } },
        { description: { contains: state.q, mode: "insensitive" } },
        { brand: { name: { contains: state.q, mode: "insensitive" } } },
        { variants: { some: { size: state.q } } },
      ],
    });
  }

  const [brands, categories, colors, products] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.color.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isPublished: true, AND: conditions },
      include: {
        brand: true,
        images: { orderBy: { position: "asc" }, take: 5 },
        variants: { select: { id: true, size: true, inStock: true } },
      },
      orderBy:
        state.sort === "price_asc"
          ? { price: "asc" }
          : state.sort === "price_desc"
            ? { price: "desc" }
            : { createdAt: "desc" },
      take: 48,
    }),
  ]);

  return (
    <main className="container-page py-10">
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-zinc-500">Каталог</p>
        <h1 className="text-5xl font-black">Все пары KULSTORE</h1>
      </div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <form method="GET" action="/catalog" className="flex flex-1 items-stretch border border-black bg-white transition-shadow duration-200 focus-within:shadow-[6px_6px_0_#101010]">
          <input type="hidden" name="category" value={state.category ?? ""} />
          <input type="hidden" name="brand" value={state.brand.join(",")} />
          <input type="hidden" name="size" value={state.size.join(",")} />
          <input type="hidden" name="color" value={state.color.join(",")} />
          <input type="hidden" name="gender" value={state.gender ?? ""} />
          <input type="hidden" name="minPrice" value={state.minPrice ?? ""} />
          <input type="hidden" name="maxPrice" value={state.maxPrice ?? ""} />
          <input type="hidden" name="sort" value={state.sort} />
          <input
            type="search"
            name="q"
            defaultValue={state.q ?? ""}
            placeholder="Поиск по названию, бренду или размеру (35–51)"
            className="min-h-12 flex-1 bg-transparent px-4 text-sm outline-none"
          />
          <button type="submit" aria-label="Искать" className="flex items-center justify-center border-l border-black px-4 transition-colors duration-150 hover:bg-black hover:text-white">
            <Search size={18} />
          </button>
        </form>
        <div className="flex items-stretch gap-2 text-sm font-bold">
          <Link
            href={buildHref({ ...state, sort: state.sort === "price_asc" ? "new" : "price_asc" })}
            className={`flex items-center border px-3 transition-colors duration-150 ${
              state.sort === "price_asc" ? "border-black bg-[var(--accent)]" : "border-black hover:bg-black hover:text-white"
            }`}
          >
            Сначала дешевле
          </Link>
          <Link
            href={buildHref({ ...state, sort: state.sort === "price_desc" ? "new" : "price_desc" })}
            className={`flex items-center border px-3 transition-colors duration-150 ${
              state.sort === "price_desc" ? "border-black bg-[var(--accent)]" : "border-black hover:bg-black hover:text-white"
            }`}
          >
            Сначала дороже
          </Link>
          <Link href="/catalog" className="flex items-center border border-black px-3 transition-colors duration-150 hover:bg-black hover:text-white">
            Сбросить всё
          </Link>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit border border-black bg-white p-4">
          <h2 className="mb-4 text-xl font-black">Фильтры</h2>
          <FilterBlock
            title="Пол"
            items={GENDER_OPTIONS.map((item) => ({
              label: item.label,
              href: buildHref({ ...state, gender: state.gender === item.value ? undefined : item.value }),
              active: state.gender === item.value,
            }))}
          />
          <FilterBlock
            title="Категории"
            items={categories.map((item) => ({
              label: item.name,
              href: buildHref({ ...state, category: state.category === item.slug ? undefined : item.slug }),
              active: state.category === item.slug,
            }))}
          />
          <FilterBlock
            title="Бренды"
            items={brands.map((item) => ({
              label: item.name,
              href: buildHref({ ...state, brand: toggled(state.brand, item.slug) }),
              active: state.brand.includes(item.slug),
            }))}
          />
          <div className="border-t border-black py-4">
            <h3 className="mb-2 text-sm font-black uppercase">Цена, ₽</h3>
            <form method="GET" action="/catalog" className="flex items-center gap-2">
              <input type="hidden" name="category" value={state.category ?? ""} />
              <input type="hidden" name="brand" value={state.brand.join(",")} />
              <input type="hidden" name="size" value={state.size.join(",")} />
              <input type="hidden" name="color" value={state.color.join(",")} />
              <input type="hidden" name="gender" value={state.gender ?? ""} />
              <input type="hidden" name="sort" value={state.sort} />
              <input type="hidden" name="q" value={state.q ?? ""} />
              <input
                type="number"
                name="minPrice"
                placeholder="От"
                min={0}
                defaultValue={state.minPrice ?? ""}
                className="min-h-10 w-full border border-black px-2 text-sm transition-colors duration-150 focus:border-[var(--accent)]"
              />
              <span>—</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="До"
                min={0}
                defaultValue={state.maxPrice ?? ""}
                className="min-h-10 w-full border border-black px-2 text-sm transition-colors duration-150 focus:border-[var(--accent)]"
              />
              <button type="submit" className="min-h-10 border border-black px-3 text-xs font-black uppercase transition-colors duration-150 hover:bg-black hover:text-white">
                OK
              </button>
            </form>
          </div>
          <div className="border-t border-black py-4">
            <h3 className="mb-2 text-sm font-black uppercase">Размер (RU 35–51)</h3>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SIZES.map((sizeValue) => {
                const active = state.size.includes(sizeValue);
                return (
                  <Link
                    key={sizeValue}
                    href={buildHref({ ...state, size: toggled(state.size, sizeValue) })}
                    className={`min-w-9 border px-2 py-1 text-center text-xs font-bold transition-colors duration-150 ${
                      active ? "border-black bg-black text-white" : "border-zinc-300 hover:border-black"
                    }`}
                  >
                    {sizeValue}
                  </Link>
                );
              })}
            </div>
          </div>
          <FilterBlock
            title="Цвета"
            items={colors.map((item) => ({
              label: item.name,
              href: buildHref({ ...state, color: toggled(state.color, item.name) }),
              active: state.color.includes(item.name),
            }))}
          />
        </aside>
        <section>
          <div className="mb-4 text-sm font-bold text-zinc-600">Найдено: {products.length}</div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
      <RecommendedProducts excludeIds={products.map((product) => product.id)} />
    </main>
  );
}

function FilterBlock({ title, items }: { title: string; items: { label: string; href: string; active: boolean }[] }) {
  return (
    <div className="border-t border-black py-4">
      <h3 className="mb-2 text-sm font-black uppercase">{title}</h3>
      <div className="grid gap-2 text-sm">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={item.active ? "font-black" : "hover:font-bold"}>
            {item.active ? "✓ " : ""}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
