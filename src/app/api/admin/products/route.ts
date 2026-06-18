import { NextRequest, NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { getProductDeletionPlan } from "@/lib/admin-product";
import { prisma } from "@/lib/prisma";

async function ensureAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  if (!(await ensureAdmin())) return NextResponse.json({ message: "Нет доступа" }, { status: 403 });
  const products = await prisma.product.findMany({ include: { brand: true, category: true, variants: true } });
  return NextResponse.json({ products });
}

export async function DELETE(request: NextRequest) {
  if (!(await ensureAdmin())) return NextResponse.json({ message: "Нет доступа" }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ message: "id обязателен" }, { status: 400 });

  const [orderItems, cartItems] = await Promise.all([
    prisma.orderItem.count({ where: { productId: id } }),
    prisma.cartItem.count({ where: { variant: { productId: id } } }),
  ]);
  const deletionPlan = getProductDeletionPlan({ orderItems, cartItems });

  if (deletionPlan.archive) {
    await prisma.product.update({ where: { id }, data: { isPublished: false } });
    return NextResponse.json({ ok: true, archived: true });
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { variant: { productId: id } } }),
    prisma.product.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true, deleted: true });
}
