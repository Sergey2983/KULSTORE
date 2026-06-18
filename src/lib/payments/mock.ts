import crypto from "node:crypto";

import type { CreatedPayment, CreatePaymentInput } from "./types";

export async function createMockPayment(input: CreatePaymentInput): Promise<CreatedPayment> {
  const providerPaymentId = `mock_${crypto.randomUUID()}`;

  return {
    provider: "mock",
    providerPaymentId,
    status: "pending",
    confirmationUrl: `/checkout/payment/${providerPaymentId}`,
    rawPayload: {
      id: providerPaymentId,
      status: "pending",
      test: true,
      amount: {
        value: input.amount.toFixed(2),
        currency: "RUB",
      },
      metadata: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
      },
    },
  };
}
