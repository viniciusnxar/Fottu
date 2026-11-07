import AdminSidebar from "@/components/AdminSidebar";
import { exigirAdmin } from "@/lib/auth";

// Só perfis com is_admin = true entram. As server actions checam de novo (acoes.ts).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await exigirAdmin();
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
