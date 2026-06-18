export type MoneyLike = string | number | { toString(): string };

export type PriceInput = {
  price: MoneyLike;
  discountPrice?: MoneyLike | null;
};

export type OrderLineInput = {
  price: MoneyLike;
  quantity: number;
};

export type StockLineInput = {
  title: string;
  size: string;
  inStock: boolean;
  quantity: number;
};

export type AppOrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "PAYMENT_FAILED";

export const ORDER_STATUS_LABELS: Record<AppOrderStatus, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
  PAYMENT_FAILED: "Ошибка оплаты",
};

export function toMoneyNumber(value: MoneyLike): number {
  const amount = typeof value === "number" ? value : Number(value.toString());
  if (!Number.isFinite(amount)) {
    throw new Error("Некорректная сумма");
  }
  return Math.round(amount * 100) / 100;
}

export function getEffectivePrice(input: PriceInput): number {
  return toMoneyNumber(input.discountPrice ?? input.price);
}

export function calculateOrderTotal(lines: OrderLineInput[]): number {
  return lines.reduce((sum, line) => sum + toMoneyNumber(line.price) * line.quantity, 0);
}

export function assertEnoughStock(lines: StockLineInput[]) {
  for (const line of lines) {
    if (line.quantity < 1) {
      throw new Error("Количество товара должно быть больше нуля");
    }

    if (!line.inStock) {
      throw new Error(`Товара ${line.title}, размер ${line.size} нет в наличии`);
    }
  }
}

export function mapYookassaStatusToOrderStatus(status: string): AppOrderStatus {
  if (status === "succeeded") return "PAID";
  if (status === "canceled") return "PAYMENT_FAILED";
  return "PENDING";
}

export function generateOrderNumber(date = new Date(), sequence = Math.floor(Math.random() * 9000) + 1000) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `KS-${y}${m}${d}-${String(sequence).padStart(4, "0")}`;
}
