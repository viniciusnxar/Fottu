import { db } from "@/lib/supabase";
import { brl, dataCurta } from "@/lib/format";

export default async function AdminUsuariosPage() {
  const [{ data: auth, error }, { data: vendas }] = await Promise.all([
    // shortcut: mostra os 1000 cadastros mais recentes; acima disso, adicione paginação.
    db.auth.admin.listUsers({ perPage: 1000 }),
    db.from("vendas").select("usuario_id, valor_total").eq("status", "PAGO")
  ]);
  if (error) throw error;
  const usuarios = [...auth.users].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Usuários</h1>

      <div className="panel mt-6 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>E-mail</th>
              <th>Cadastro</th>
              <th className="!text-right">Compras</th>
              <th className="!text-right">Total gasto</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted">
                  Nenhum usuário ainda. Quem entrar pelo login aparece aqui.
                </td>
              </tr>
            )}
            {usuarios.map((u) => {
              const minhas = (vendas ?? []).filter((v) => v.usuario_id === u.id);
              return (
                <tr key={u.id}>
                  <td className="text-ink">{u.email}</td>
                  <td className="text-muted">{dataCurta(u.created_at)}</td>
                  <td className="tabular text-right">{minhas.length}</td>
                  <td className="tabular text-right">{brl(minhas.reduce((s, v) => s + Number(v.valor_total), 0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
