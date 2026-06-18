import Link from "next/link";
import { Mail } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { SocialLinks } from "@/components/social-links";

export async function Footer() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, take: 6 });

  return (
    <footer className="border-t border-black bg-black text-white">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div className="space-y-4">
          <p className="text-2xl font-black tracking-tight">KULSTORE</p>
          <p className="max-w-sm text-sm leading-6 text-zinc-400">
            Магазин обуви для города: от спортивных Nike и Adidas до люксовых Gucci и Balenciaga. Честные остатки,
            быстрый каталог и оплата через ЮKassa.
          </p>
          <SocialLinks
            size={16}
            className="gap-3 pt-2"
            linkClassName="border border-white/30 p-2 transition hover:border-white"
          />
        </div>
        <div>
          <p className="mb-4 text-xs font-black uppercase text-zinc-500">Каталог</p>
          <div className="grid gap-2 text-sm text-zinc-300">
            {categories.map((category) => (
              <Link key={category.slug} href={`/catalog?category=${category.slug}`} className="transition-colors duration-150 hover:text-white">
                {category.name}
              </Link>
            ))}
            <Link href="/catalog" className="transition-colors duration-150 hover:text-white">
              Все товары
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-black uppercase text-zinc-500">Покупателям</p>
          <div className="grid gap-2 text-sm text-zinc-300">
            <Link href="/cart" className="transition-colors duration-150 hover:text-white">
              Корзина
            </Link>
            <Link href="/profile/orders" className="transition-colors duration-150 hover:text-white">
              Мои заказы
            </Link>
            <Link href="/login" className="transition-colors duration-150 hover:text-white">
              Войти
            </Link>
            <Link href="/register" className="transition-colors duration-150 hover:text-white">
              Регистрация
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-black uppercase text-zinc-500">Контакты</p>
          <div className="grid gap-2 text-sm text-zinc-300">
            <a href="mailto:hello@kulstore.local" className="flex items-center gap-2 transition-colors duration-150 hover:text-white">
              <Mail size={16} /> hello@kulstore.local
            </a>
            <p>Ежедневно с 10:00 до 22:00</p>
            <p>Оплата картой онлайн</p>
          </div>
        </div>
      </div>
      <div className="container-page flex flex-col gap-2 border-t border-white/10 py-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} KULSTORE. Все права защищены.</p>
        <p>Сделано на Next.js · Prisma · PostgreSQL</p>
      </div>
    </footer>
  );
}
