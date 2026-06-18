"use client";

import { useActionState } from "react";

import { checkoutAction, type ActionState } from "@/app/actions";
import { Button } from "./button";

const initialState: ActionState = {};

export function CheckoutForm() {
  const [state, action, pending] = useActionState(checkoutAction, initialState);

  return (
    <form action={action} className="grid gap-4 border border-black bg-white p-5">
      <h2 className="text-2xl font-black">Адрес доставки</h2>
      <Field label="Город" name="city" />
      <Field label="Улица" name="street" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Дом" name="house" />
        <Field label="Квартира" name="apartment" />
        <Field label="Индекс" name="zipCode" />
      </div>
      {state.message ? <p className="border border-red-600 bg-red-50 p-3 text-sm font-bold text-red-700">{state.message}</p> : null}
      <Button disabled={pending} variant="secondary">
        {pending ? "Создаём заказ и платёж..." : "Перейти к оплате"}
      </Button>
    </form>
  );
}

function Field(props: React.ComponentProps<"input"> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="grid gap-2 text-sm font-black uppercase">
      {label}
      <input className="min-h-12 border border-black bg-white px-3 text-base font-normal normal-case" {...inputProps} />
    </label>
  );
}
