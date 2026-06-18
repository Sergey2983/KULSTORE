import { describe, expect, it } from "vitest";

import {
  assertEnoughStock,
  calculateOrderTotal,
  generateOrderNumber,
  getEffectivePrice,
  mapYookassaStatusToOrderStatus,
} from "./order";

describe("order business rules", () => {
  it("uses discount price when present", () => {
    expect(getEffectivePrice({ price: "12990.00", discountPrice: "9990.00" })).toBe(9990);
    expect(getEffectivePrice({ price: "12990.00", discountPrice: null })).toBe(12990);
  });

  it("calculates an order total from purchase prices and quantities", () => {
    expect(
      calculateOrderTotal([
        { price: "9990.00", quantity: 2 },
        { price: 3500, quantity: 1 },
      ]),
    ).toBe(23480);
  });

  it("rejects out-of-stock variants", () => {
    expect(() =>
      assertEnoughStock([
        { title: "Air Pulse", size: "42", inStock: false, quantity: 2 },
      ]),
    ).toThrow("Товара Air Pulse, размер 42 нет в наличии");
  });

  it("maps YooKassa terminal statuses to order statuses", () => {
    expect(mapYookassaStatusToOrderStatus("succeeded")).toBe("PAID");
    expect(mapYookassaStatusToOrderStatus("canceled")).toBe("PAYMENT_FAILED");
    expect(mapYookassaStatusToOrderStatus("pending")).toBe("PENDING");
  });

  it("generates human readable order numbers", () => {
    expect(generateOrderNumber(new Date("2026-06-17T10:00:00.000Z"), 42)).toBe("KS-20260617-0042");
  });
});
