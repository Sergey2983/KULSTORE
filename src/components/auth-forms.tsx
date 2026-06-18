"use client";

import { useActionState } from "react";

import { loginAction, registerAction, type ActionState } from "@/app/actions";
import { Button } from "./button";

const initialState: ActionState = {};

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Пароль" name="password" type="password" autoComplete="current-password" />
      {state.message ? <p className="border border-red-600 bg-red-50 p-3 text-sm font-bold text-red-700">{state.message}</p> : null}
      <Button disabled={pending}>{pending ? "Входим..." : "Войти"}</Button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <Field label="Имя" name="name" autoComplete="name" />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Пароль" name="password" type="password" autoComplete="new-password" />
      {state.message ? <p className="border border-red-600 bg-red-50 p-3 text-sm font-bold text-red-700">{state.message}</p> : null}
      <Button disabled={pending}>{pending ? "Создаём..." : "Зарегистрироваться"}</Button>
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
