import { db } from "@/lib/supabase";
import { brl, dataHora } from "@/lib/format";

export default async function AdminTransacoesPage() {
  const { data, error } = await db
    .from("transacoes")
    .select("id, venda_id, metodo, valor, criado_em, vendas(email)")
    .order("criado_em", { ascending: false })
    .limit(200);
  if (error) throw error;
  const transacoes = data ?? [];

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
                  Nenhuma transação ainda. Pagamentos confirmados aparecem aqui.
                </td>
              </tr>
            )}
            {transacoes.map((t) => (
              <tr key={t.id}>
                <td className="tabular whitespace-nowrap text-muted">{dataHora(t.criado_em)}</td>
                <td className="text-ink">{(t.vendas as unknown as { email: string } | null)?.email}</td>
                <td className="uppercase text-muted">{t.metodo}</td>
                <td className="tabular text-muted">#{t.venda_id.slice(-8)}</td>
                <td className="tabular text-right">{brl(t.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
