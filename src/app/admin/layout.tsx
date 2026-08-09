import AdminSidebar from "@/components/AdminSidebar";

// TODO: proteger este layout com autenticação de Admin (tabela `Admin` do schema)
// antes de ir pra produção — hoje qualquer pessoa acessa /admin.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-sand">
      <AdminSidebar />
      <div className="flex-1 px-8 py-6">{children}</div>
    </div>
  );
}
