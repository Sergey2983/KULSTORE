import Link from "next/link";
import { Bell, ShoppingBag, UserRound } from "lucide-react";

import { auth, signOut } from "../../auth";
import { Button } from "./button";
import { CatalogMegaMenu } from "./mega-menu";
import { SocialLinks } from "./social-links";
import { prisma } from "@/lib/prisma";

export async function Header() {
  const [session, categories, brands] = await Promise.all([
    auth(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const [cartCount, notificationCount] = session?.user?.id
    ? await Promise.all([
        prisma.cartItem.count({ where: { cart: { userId: session.user.id } } }),
        prisma.notification.count({ where: { userId: session.user.id, isRead: false } }),
      ])
    : [0, 0];

  return (
    <header className="sticky top-0 z-40 border-b border-black bg-[var(--background)]/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-black tracking-tight">
          KULSTORE
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold uppercase md:flex">
          <CatalogMegaMenu categories={categories} brands={brands} />
          {session?.user?.role === "ADMIN" ? <Link href="/admin">Админка</Link> : null}
        </nav>
        <div className="flex items-center gap-2">
          <SocialLinks
            size={18}
            className="mr-1 hidden gap-1 sm:flex"
            linkClassName="border border-black p-2 transition-colors duration-150 hover:bg-black hover:text-white"
          />
          <Link aria-label="Корзина" href="/cart" className="relative border border-black p-2 transition-colors duration-150 hover:bg-black hover:text-white">
            <ShoppingBag size={20} />
            {cartCount > 0 ? (
              <span
                key={cartCount}
                className="animate-badge-pop absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-black text-black"
              >
                {cartCount}
              </span>
            ) : null}
          </Link>
          {session?.user ? (
            <>
              <Link aria-label="Уведомления" href="/profile/notifications" className="relative border border-black p-2 transition-colors duration-150 hover:bg-black hover:text-white">
                <Bell size={20} />
                {notificationCount > 0 ? (
                  <span
                    key={notificationCount}
                    className="animate-badge-pop absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-black text-black"
                  >
                    {notificationCount}
                  </span>
                ) : null}
              </Link>
              <Link aria-label="Профиль" href="/profile" className="border border-black p-2 transition-colors duration-150 hover:bg-black hover:text-white">
                <UserRound size={20} />
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="ghost" className="hidden md:inline-flex">
                  Выйти
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login" className="border border-black px-3 py-2 text-sm font-black uppercase transition-colors duration-150 hover:bg-black hover:text-white">
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
