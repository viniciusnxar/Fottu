import AdminSidebar from "@/components/AdminSidebar";

// TODO: proteger este layout com autenticação de Admin (tabela `Admin` do schema)
// antes de ir pra produção — hoje qualquer pessoa acessa /admin.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
