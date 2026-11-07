import { db } from "@/lib/supabase";
import { brl } from "@/lib/format";

type ItemPago = { preco: number; fotos: { anuncio_id: string } };

export default async function AdminDashboard() {
  const [vendas, transacoes, anuncios, itens] = await Promise.all([
    db.from("vendas").select("id", { count: "exact", head: true }).eq("status", "PAGO"),
    db.from("transacoes").select("valor"),
    db.from("anuncios").select("id, titulo, local, status").order("data", { ascending: false }),
    // shortcut: agrega em JS todos os itens pagos; com dezenas de milhares de vendas, troque por uma view/RPC com SUM/GROUP BY.
    db.from("itens_venda").select("preco, fotos(anuncio_id), vendas!inner(status)").eq("vendas.status", "PAGO")
  ]);

  const receita = (transacoes.data ?? []).reduce((s, t) => s + Number(t.valor), 0);
  const lista = anuncios.data ?? [];
  const pagos = (itens.data ?? []) as unknown as ItemPago[];
  const linhas = lista.map((a) => {
    const meus = pagos.filter((i) => i.fotos.anuncio_id === a.id);
    return { ...a, qtdVendas: meus.length, total: meus.reduce((s, i) => s + Number(i.preco), 0) };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Visão geral</h1>

      <dl className="panel mt-6 grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Indicador titulo="Vendas pagas" valor={String(vendas.count ?? 0)} />
        <Indicador titulo="Receita total" valor={brl(receita)} />
        <Indicador titulo="Anúncios online" valor={String(lista.filter((a) => a.status === "ONLINE").length)} />
      </dl>

      <h2 className="mb-3 mt-10 text-sm font-semibold text-ink">Vendas por anúncio</h2>
      <div className="panel overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Anúncio</th>
              <th>Local</th>
              <th>Status</th>
              <th className="!text-right">Fotos vendidas</th>
              <th className="!text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  Nenhum anúncio ainda.
                </td>
              </tr>
            )}
            {linhas.map((l) => (
              <tr key={l.id}>
                <td className="font-medium text-ink">{l.titulo}</td>
                <td className="text-muted">{l.local}</td>
                <td>
                  <Status online={l.status === "ONLINE"} />
                </td>
                <td className="tabular text-right">{l.qtdVendas}</td>
                <td className="tabular text-right">{brl(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Indicador({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="p-5">
      <dt className="text-sm text-muted">{titulo}</dt>
      <dd className="tabular mt-1 text-2xl font-semibold text-ink">{valor}</dd>
    </div>
  );
}

function Status({ online }: { online: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${online ? "text-success" : "text-muted"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-success" : "bg-muted/50"}`} />
      {online ? "Online" : "Offline"}
    </span>
  );
}
