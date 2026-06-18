import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/authz";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="container-page grid gap-6 py-10 md:grid-cols-[220px_1fr] md:items-start">
      <AdminNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
