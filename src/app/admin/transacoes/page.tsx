import { db } from "@/lib/db";
import { brl } from "@/lib/format";

export default function AdminTransacoesPage() {
  const transacoes = [...db.transacoes].sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()).slice(0, 200);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Transações</h1>

      <div className="panel mt-6 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Data</th>
              <th>Comprador</th>
              <th>Método</th>
              <th>Pedido</th>
              <th className="!text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  Nenhuma transação ainda. Faça uma compra de teste para ver aqui.
                </td>
              </tr>
            )}
            {transacoes.map((t) => {
              const venda = db.vendas.find((v) => v.id === t.vendaId);
              const email = db.usuarios.find((u) => u.id === venda?.usuarioId)?.email;
              return (
                <tr key={t.id}>
                  <td className="tabular whitespace-nowrap text-muted">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(t.criadoEm)}
                  </td>
                  <td className="text-ink">{email}</td>
                  <td className="uppercase text-muted">{t.metodo}</td>
                  <td className="tabular text-muted">#{t.vendaId.slice(-8)}</td>
                  <td className="tabular text-right">{brl(t.valor)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
