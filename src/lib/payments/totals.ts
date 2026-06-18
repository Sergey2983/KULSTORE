import { calculateOrderTotal, toMoneyNumber, type OrderLineInput } from "../order";

export const FREE_DELIVERY_THRESHOLD = 5000;
export const DELIVERY_FEE = 300;

export function calculateCheckoutTotals(lines: OrderLineInput[]) {
  const subtotal = calculateOrderTotal(lines);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  return {
    subtotal,
    deliveryFee,
    total: toMoneyNumber(subtotal + deliveryFee),
  };
}
