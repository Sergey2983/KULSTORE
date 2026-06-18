import { notFound, redirect } from "next/navigation";
import { CreditCard, Lock } from "lucide-react";

import { cancelMockPaymentAction, confirmMockPaymentAction } from "@/app/actions";
import { Button } from "@/components/button";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const user = await requireUser();
  const { paymentId } = await params;
  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId: paymentId },
    include: {
      order: {
        include: {
          items: { include: { product: true, variant: { include: { color: true } } } },
        },
      },
    },
  });

  if (!payment || payment.provider !== "mock" || payment.order.userId !== user.id) notFound();

  if (payment.status === "succeeded") {
    redirect(`/checkout/success?order=${payment.order.orderNumber}`);
  }

  if (payment.status === "canceled") {
    redirect(`/checkout/fail?order=${payment.order.orderNumber}`);
  }

  return (
    <main className="container-page py-10">
      <section className="mx-auto grid max-w-md gap-6">
        <div className="grid gap-5 border border-black bg-white p-6 street-shadow">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CreditCard size={20} />
              <span className="text-sm font-black uppercase">Оплата картой</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-zinc-500">
              <Lock size={14} /> Безопасно
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-y border-black py-4">
            <div>
              <p className="text-xs font-black uppercase text-zinc-500">Заказ {payment.order.orderNumber}</p>
              <p className="text-sm text-zinc-600">{payment.order.items.length} поз.</p>
            </div>
            <span className="text-3xl font-black">{formatPrice(payment.amount)}</span>
          </div>

          <form action={confirmMockPaymentAction} className="grid gap-4">
            <input type="hidden" name="providerPaymentId" value={payment.providerPaymentId} />

            <label className="grid gap-1 text-xs font-black uppercase">
              Номер карты
              <input
                name="cardNumber"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                defaultValue="4111 1111 1111 1111"
                className="min-h-11 border border-black px-3 text-base font-normal tracking-widest"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1 text-xs font-black uppercase">
                Срок
                <input
                  name="cardExpiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="ММ/ГГ"
                  defaultValue="12/30"
                  className="min-h-11 border border-black px-3 text-base font-normal tracking-widest"
                />
              </label>
              <label className="grid gap-1 text-xs font-black uppercase">
                CVC
                <input
                  name="cardCvc"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="000"
                  defaultValue="123"
                  className="min-h-11 border border-black px-3 text-base font-normal tracking-widest"
                />
              </label>
            </div>

            <label className="grid gap-1 text-xs font-black uppercase">
              Имя на карте
              <input
                name="cardHolder"
                autoComplete="cc-name"
                placeholder="IVAN IVANOV"
                defaultValue="IVAN IVANOV"
                className="min-h-11 border border-black px-3 text-base font-normal uppercase"
              />
            </label>

            <Button variant="secondary" className="w-full">
              Оплатить {formatPrice(payment.amount)}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-3 text-xs font-black uppercase text-zinc-400">
            <span>МИР</span>
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>SBERPAY</span>
          </div>
        </div>

        <form action={cancelMockPaymentAction} className="text-center">
          <input type="hidden" name="providerPaymentId" value={payment.providerPaymentId} />
          <button type="submit" className="text-sm font-bold text-zinc-500 underline-offset-4 hover:text-black hover:underline">
            Отменить оплату
          </button>
        </form>
      </section>
    </main>
  );
}
