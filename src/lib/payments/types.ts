import type { AppOrderStatus } from "../order";

export type PaymentProvider = "mock" | "yookassa";

export type CreatePaymentInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
};

export type CreatedPayment = {
  provider: PaymentProvider;
  providerPaymentId: string;
  status: string;
  confirmationUrl?: string;
  rawPayload: unknown;
};

export type PaymentFinalizationPlan = {
  paymentStatus: string;
  orderStatus: AppOrderStatus;
  shouldMarkStockSold: boolean;
  shouldNotify: boolean;
};
