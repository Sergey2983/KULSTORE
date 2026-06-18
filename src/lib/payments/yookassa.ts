import crypto from "node:crypto";

import { getYookassaConfig } from "./config";
import type { CreatedPayment, CreatePaymentInput } from "./types";

export type YooPaymentResponse = {
  id: string;
  status: string;
  confirmation?: { confirmation_url?: string };
};

function getAuthHeader(shopId: string, secretKey: string) {
  return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`;
}

export async function createYookassaPayment(input: CreatePaymentInput): Promise<CreatedPayment> {
  const { shopId, secretKey, baseUrl } = getYookassaConfig();
  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(shopId, secretKey),
      "Content-Type": "application/json",
      "Idempotence-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      amount: {
        value: input.amount.toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${baseUrl}/checkout/success?order=${input.orderNumber}`,
      },
      description: `Заказ ${input.orderNumber}`,
      metadata: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ЮKassa отклонила создание платежа: ${errorText}`);
  }

  const payload = (await response.json()) as YooPaymentResponse;

  return {
    provider: "yookassa",
    providerPaymentId: payload.id,
    status: payload.status,
    confirmationUrl: payload.confirmation?.confirmation_url,
    rawPayload: payload,
  };
}

export async function fetchYookassaPayment(paymentId: string) {
  const { shopId, secretKey } = getYookassaConfig();
  const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    headers: {
      Authorization: getAuthHeader(shopId, secretKey),
    },
  });

  if (!response.ok) {
    throw new Error("Не удалось проверить статус платежа в ЮKassa");
  }

  return (await response.json()) as YooPaymentResponse;
}
