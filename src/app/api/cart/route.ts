import { NextRequest, NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Требуется вход" }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { variant: { include: { product: true, color: true } } } } },
  });

  return NextResponse.json({ cart });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Требуется вход" }, { status: 401 });

  const body = (await request.json()) as { variantId?: string; quantity?: number };
  if (!body.variantId) return NextResponse.json({ message: "variantId обязателен" }, { status: 400 });

  const quantity = Math.max(1, Number(body.quantity ?? 1));
  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  const item = await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: body.variantId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, variantId: body.variantId, quantity },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Требуется вход" }, { status: 401 });
  const itemId = request.nextUrl.searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ message: "itemId обязателен" }, { status: 400 });
  // Удаляем только позицию из корзины текущего пользователя (защита от чужих itemId).
  const { count } = await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: { userId: session.user.id } },
  });
  if (!count) return NextResponse.json({ message: "Позиция не найдена" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
