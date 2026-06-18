import type { Prisma } from "@prisma/client";

import { ORDER_STATUS_LABELS, type AppOrderStatus } from "../order";
import { prisma } from "../prisma";

import type { PaymentFinalizationPlan } from "./types";

export function getPaymentFinalizationPlan(currentStatus: string, incomingStatus: string): PaymentFinalizationPlan {
  if (currentStatus === "succeeded") {
    return {
      paymentStatus: "succeeded",
      orderStatus: "PAID",
      shouldMarkStockSold: false,
      shouldNotify: false,
    };
  }

  if (incomingStatus === "succeeded") {
    return {
      paymentStatus: "succeeded",
      orderStatus: "PAID",
      shouldMarkStockSold: true,
      shouldNotify: currentStatus !== "succeeded",
    };
  }

  if (incomingStatus === "canceled") {
    return {
      paymentStatus: "canceled",
      orderStatus: "PAYMENT_FAILED",
      shouldMarkStockSold: false,
      shouldNotify: currentStatus !== "canceled",
    };
  }

  return {
    paymentStatus: incomingStatus,
    orderStatus: "PENDING",
    shouldMarkStockSold: false,
    shouldNotify: false,
  };
}

export async function applyPaymentStatus(paymentId: string, incomingStatus: string, rawPayload?: unknown) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { items: true } } },
    });

    if (!payment) return null;

    const plan = getPaymentFinalizationPlan(payment.status, incomingStatus);

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: plan.paymentStatus,
        ...(rawPayload === undefined ? {} : { rawPayload: rawPayload as Prisma.InputJsonValue }),
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: plan.orderStatus as never },
    });

    if (plan.shouldMarkStockSold) {
      await tx.productVariant.updateMany({
        where: { id: { in: payment.order.items.map((item) => item.variantId) } },
        data: { inStock: false },
      });
    }

    if (plan.shouldNotify) {
      await tx.notification.create({
        data: {
          userId: payment.order.userId,
          orderId: payment.orderId,
          message: `Статус заказа ${payment.order.orderNumber}: ${ORDER_STATUS_LABELS[plan.orderStatus as AppOrderStatus]}`,
        },
      });
    }

    return { paymentId: payment.id, orderId: payment.orderId, ...plan };
  });
}
