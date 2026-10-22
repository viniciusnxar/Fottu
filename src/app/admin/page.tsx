import { db } from "@/lib/db";
import { brl } from "@/lib/format";

export default function AdminDashboard() {
  const pagas = db.vendas.filter((v) => v.status === "PAGO");
  const receita = db.transacoes.reduce((s, t) => s + t.valor, 0);
  const anunciosOnline = db.anuncios.filter((a) => a.status === "ONLINE").length;

  const linhas = db.anuncios.map((a) => {
    const itens = pagas.flatMap((v) => v.itens).filter((i) => db.fotos.find((f) => f.id === i.fotoId)?.anuncioId === a.id);
    return { ...a, qtdVendas: itens.length, total: itens.reduce((s, i) => s + i.preco, 0) };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Visão geral</h1>

      <dl className="panel mt-6 grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Indicador titulo="Vendas pagas" valor={String(pagas.length)} />
        <Indicador titulo="Receita total" valor={brl(receita)} />
        <Indicador titulo="Anúncios online" valor={String(anunciosOnline)} />
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
