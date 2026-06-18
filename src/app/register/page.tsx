import Link from "next/link";

import { RegisterForm } from "@/components/auth-forms";
import { RecommendedProducts } from "@/components/recommended-products";

export default function RegisterPage() {
  return (
    <main className="container-page py-12">
      <section className="mx-auto w-full max-w-md border border-black bg-white p-6 street-shadow">
        <p className="text-sm font-black uppercase text-zinc-500">Новый покупатель</p>
        <h1 className="mb-6 text-4xl font-black">Регистрация</h1>
        <RegisterForm />
        <p className="mt-5 text-sm">
          Уже есть аккаунт? <Link className="font-black underline" href="/login">Войти</Link>
        </p>
      </section>
      <RecommendedProducts />
    </main>
  );
}
