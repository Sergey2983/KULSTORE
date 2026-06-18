import { NextResponse } from "next/server";

import { auth } from "../../../../auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Требуется вход" }, { status: 401 });
  return NextResponse.json({
    message: "Checkout выполняется через server action формы /checkout, чтобы безопасно создать адрес, заказ и платеж.",
  });
}
