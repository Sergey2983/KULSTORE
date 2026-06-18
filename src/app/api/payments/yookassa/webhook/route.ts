import { NextRequest, NextResponse } from "next/server";

import { applyPaymentStatus } from "@/lib/payments/finalize";
import { prisma } from "@/lib/prisma";
import { fetchYookassaPayment } from "@/lib/payments/yookassa";

type YooWebhook = {
  type: "notification";
  event: "payment.succeeded" | "payment.canceled" | string;
  object: {
    id: string;
    status: string;
    metadata?: { orderId?: string };
  };
};

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as YooWebhook;
  if (!payload.object?.id) return NextResponse.json({ message: "Некорректное уведомление" }, { status: 400 });

  if (!["payment.succeeded", "payment.canceled"].includes(payload.event)) {
    return NextResponse.json({ ok: true });
  }

  const verified = await fetchYookassaPayment(payload.object.id);
  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId: payload.object.id },
    include: { order: true },
  });

  if (!payment || payment.provider !== "yookassa") {
    return NextResponse.json({ ok: true });
  }

  await applyPaymentStatus(payment.id, verified.status, verified);

  return NextResponse.json({ ok: true });
}
