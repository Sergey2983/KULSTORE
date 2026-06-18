import { getPaymentProvider } from "./config";
import { createMockPayment } from "./mock";
import type { CreatePaymentInput } from "./types";
import { createYookassaPayment } from "./yookassa";

export async function createPayment(input: CreatePaymentInput) {
  const provider = getPaymentProvider();

  if (provider === "yookassa") {
    return createYookassaPayment(input);
  }

  return createMockPayment(input);
}

export type { CreatedPayment, CreatePaymentInput, PaymentProvider } from "./types";
