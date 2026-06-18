"use client";

import { ChevronDown } from "lucide-react";

type Spec = { label: string; value: string };

export function ProductInfoAccordion({ specs }: { specs: Spec[] }) {
  return (
    <div className="mt-6 grid gap-2 border-t border-black pt-6">
      <Item title="Характеристики" defaultOpen>
        <dl className="grid gap-3 sm:grid-cols-2">
          {specs.map((spec) => (
            <div key={spec.label} className="border-b border-zinc-200 pb-2">
              <dt className="text-xs font-black uppercase text-zinc-500">{spec.label}</dt>
              <dd className="mt-1 font-bold">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </Item>
      <Item title="Доставка">
        <div className="grid gap-3 leading-7 text-zinc-700">
          <p>Доставка курьером по городу — 1–2 дня. Доставка в другие регионы СДЭК/Почтой России — 3–7 дней.</p>
          <p>Бесплатная доставка при заказе от 8 000 ₽. Самовывоз из шоурума KULSTORE в день заказа.</p>
        </div>
      </Item>
      <Item title="Оплата">
        <div className="grid gap-3 leading-7 text-zinc-700">
          <p>Онлайн-оплата картой через ЮKassa сразу после оформления заказа.</p>
          <p>Поддерживаются карты МИР, Visa, Mastercard, а также SberPay и оплата по QR-коду.</p>
        </div>
      </Item>
    </div>
  );
}

function Item({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border border-black bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-black uppercase">
        {title}
        <ChevronDown size={18} className="transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-t border-black p-4">{children}</div>
    </details>
  );
}
