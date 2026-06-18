import type { PaymentProvider } from "./types";

type EnvLike = Record<string, string | undefined>;

export function getPaymentProvider(env: EnvLike = process.env): PaymentProvider {
  const provider = (env.PAYMENT_PROVIDER ?? "mock").trim().toLowerCase();

  if (provider === "mock" || provider === "yookassa") {
    return provider;
  }

  throw new Error(`Неизвестный провайдер оплаты "${provider}"`);
}

export function getBaseUrl(env: EnvLike = process.env) {
  return env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function getYookassaConfig(env: EnvLike = process.env) {
  const shopId = env.YOOKASSA_SHOP_ID;
  const secretKey = env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    throw new Error("ЮKassa не настроена: задайте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY");
  }

  return { shopId, secretKey, baseUrl: getBaseUrl(env) };
}
