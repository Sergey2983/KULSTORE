import Link from "next/link";

import { LoginForm } from "@/components/auth-forms";
import { RecommendedProducts } from "@/components/recommended-products";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return (
    <main className="container-page py-12">
      <section className="mx-auto w-full max-w-md border border-black bg-white p-6 street-shadow">
        <p className="text-sm font-black uppercase text-zinc-500">KULSTORE ID</p>
        <h1 className="mb-6 text-4xl font-black">Вход</h1>
        <LoginForm callbackUrl={callbackUrl} />
        <p className="mt-5 text-sm">
          Нет аккаунта? <Link className="font-black underline" href="/register">Зарегистрироваться</Link>
        </p>
      </section>
      <RecommendedProducts />
    </main>
  );
}
