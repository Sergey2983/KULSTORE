import Image from "next/image";
import Link from "next/link";

import { deleteProductAction } from "@/app/actions";
import { Button, ButtonLink } from "@/components/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const products = await prisma.product.findMany({
    include: { brand: true, images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl font-black">Товары</h1>
        <ButtonLink href="/admin/products/new" variant="secondary">+ Добавить товар</ButtonLink>
      </div>
      {params.deleted ? (
        <p className="mb-6 border border-black bg-[var(--accent)] p-4 text-sm font-bold">Товар удалён.</p>
      ) : null}
      {params.archived ? (
        <p className="mb-6 border border-black bg-white p-4 text-sm font-bold">
          Товар встречается в заказах, поэтому он снят с публикации (скрыт), а не удалён — так сохраняется история
          заказов.
        </p>
      ) : null}
      <section className="overflow-hidden border border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-3">Товар</th>
              <th className="p-3">Бренд</th>
              <th className="p-3">Цена</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-black transition-colors duration-150 hover:bg-zinc-50">
                <td className="p-3 font-black">
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.images[0]?.url ?? "/products/placeholder.svg"}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="h-12 w-12 object-cover"
                    />
                    {product.title}
                  </div>
                </td>
                <td className="p-3">{product.brand.name}</td>
                <td className="p-3">{formatPrice(product.discountPrice ?? product.price)}</td>
                <td className="p-3">
                  <span
                    className={`border px-2 py-1 text-xs font-black uppercase ${
                      product.isPublished ? "border-black bg-[var(--accent)]" : "border-zinc-400 text-zinc-500"
                    }`}
                  >
                    {product.isPublished ? "Опубликован" : "Скрыт"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="border border-black px-3 py-1.5 text-xs font-black uppercase transition-colors duration-150 hover:bg-black hover:text-white"
                    >
                      Редактировать
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <Button variant="danger" className="px-3 py-1.5 text-xs">Удалить</Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
