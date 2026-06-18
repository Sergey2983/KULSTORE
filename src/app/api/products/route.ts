import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function csv(value: string | null) {
  return value?.split(",").filter(Boolean) ?? [];
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const brands = csv(params.get("brand"));
  const sizes = csv(params.get("size"));
  const colors = csv(params.get("color"));
  const category = params.get("category") ?? undefined;
  const gender = params.get("gender") ?? undefined;
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const sort = params.get("sort") ?? "new";

  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(brands.length ? { brand: { slug: { in: brands } } } : {}),
      ...(gender ? { gender: gender as never } : {}),
      ...(minPrice ? { price: { gte: minPrice } } : {}),
      ...(maxPrice ? { price: { lte: maxPrice } } : {}),
      ...(sizes.length || colors.length
        ? {
            variants: {
              some: {
                ...(sizes.length ? { size: { in: sizes } } : {}),
                ...(colors.length ? { color: { name: { in: colors } } } : {}),
                inStock: true,
              },
            },
          }
        : {}),
    },
    include: { brand: true, category: true, images: { take: 1, orderBy: { position: "asc" } } },
    orderBy: sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" },
    skip: (page - 1) * 24,
    take: 24,
  });

  return NextResponse.json({ products, page });
}
