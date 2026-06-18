import { describe, expect, it } from "vitest";

import { getPaymentProvider } from "./config";
import { getPaymentFinalizationPlan } from "./finalize";
import { calculateCheckoutTotals } from "./totals";

describe("adaptive payment configuration", () => {
  it("defaults to local mock payments", () => {
    expect(getPaymentProvider({})).toBe("mock");
  });

  it("accepts explicit mock and yookassa providers", () => {
    expect(getPaymentProvider({ PAYMENT_PROVIDER: "mock" })).toBe("mock");
    expect(getPaymentProvider({ PAYMENT_PROVIDER: "yookassa" })).toBe("yookassa");
  });

  it("rejects unknown payment providers with a Russian error", () => {
    expect(() => getPaymentProvider({ PAYMENT_PROVIDER: "stripe" })).toThrow(
      'Неизвестный провайдер оплаты "stripe"',
    );
  });
});

describe("checkout totals", () => {
  it("adds delivery fee below the free delivery threshold", () => {
    expect(calculateCheckoutTotals([{ price: 1200, quantity: 2 }])).toEqual({
      subtotal: 2400,
      deliveryFee: 300,
      total: 2700,
    });
  });

  it("makes delivery free from five thousand rubles", () => {
    expect(calculateCheckoutTotals([{ price: "2500.00", quantity: 2 }])).toEqual({
      subtotal: 5000,
      deliveryFee: 0,
      total: 5000,
    });
  });
});

describe("payment finalization plan", () => {
  it("marks stock only on the first successful payment transition", () => {
    expect(getPaymentFinalizationPlan("pending", "succeeded")).toEqual({
      paymentStatus: "succeeded",
      orderStatus: "PAID",
      shouldMarkStockSold: true,
      shouldNotify: true,
    });

    expect(getPaymentFinalizationPlan("succeeded", "succeeded")).toEqual({
      paymentStatus: "succeeded",
      orderStatus: "PAID",
      shouldMarkStockSold: false,
      shouldNotify: false,
    });
  });

  it("keeps already paid orders paid if a late canceled status arrives", () => {
    expect(getPaymentFinalizationPlan("succeeded", "canceled")).toEqual({
      paymentStatus: "succeeded",
      orderStatus: "PAID",
      shouldMarkStockSold: false,
      shouldNotify: false,
    });
  });

  it("maps canceled payments to payment failed orders", () => {
    expect(getPaymentFinalizationPlan("pending", "canceled")).toEqual({
      paymentStatus: "canceled",
      orderStatus: "PAYMENT_FAILED",
      shouldMarkStockSold: false,
      shouldNotify: true,
    });
  });
});
