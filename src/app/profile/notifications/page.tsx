import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Новые уведомления подсвечиваются в этот заход (используем снимок до обновления),
  // а затем помечаются прочитанными — при повторном заходе они станут обычными.
  const unreadIds = notifications.filter((notification) => !notification.isRead).map((notification) => notification.id);
  if (unreadIds.length) {
    await prisma.notification.updateMany({ where: { id: { in: unreadIds } }, data: { isRead: true } });
  }

  return (
    <main className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl font-black">Уведомления</h1>
      </div>

      {notifications.length ? (
        <div className="grid gap-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`grid gap-1 border border-black p-5 ${notification.isRead ? "bg-white" : "bg-[var(--accent)]/15"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-black">{notification.message}</p>
                {notification.isRead ? null : (
                  <span className="shrink-0 bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-black uppercase">Новое</span>
                )}
              </div>
              <p className="text-sm text-zinc-500">{formatDate(notification.createdAt)}</p>
              {notification.orderId ? (
                <Link href="/profile/orders" className="text-sm font-black uppercase underline-offset-4 hover:underline">
                  К заказам →
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Уведомлений пока нет" actionHref="/profile/orders" actionLabel="Мои заказы" />
      )}
    </main>
  );
}
