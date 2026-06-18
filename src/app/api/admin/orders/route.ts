import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ message: "Нет доступа" }, { status: 403 });
  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true } }, payment: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}
