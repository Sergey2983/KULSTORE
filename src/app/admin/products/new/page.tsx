import { AdminProductForm } from "@/components/admin-product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const [brands, categories, colors] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.color.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-5xl font-black">Новый товар</h1>
      <div className="max-w-4xl">
        <AdminProductForm brands={brands} categories={categories} colors={colors} />
      </div>
    </div>
  );
}
