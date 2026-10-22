import { db } from "@/lib/db";
import { brl, dataCurta } from "@/lib/format";

export default function AdminUsuariosPage() {
  const usuarios = [...db.usuarios].sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());

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
              const vendas = db.vendas.filter((v) => v.usuarioId === u.id && v.status === "PAGO");
              return (
                <tr key={u.id}>
                  <td className="text-ink">{u.email}</td>
                  <td className="text-muted">{dataCurta(u.criadoEm)}</td>
                  <td className="tabular text-right">{vendas.length}</td>
                  <td className="tabular text-right">{brl(vendas.reduce((s, v) => s + v.valorTotal, 0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
