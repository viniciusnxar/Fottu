import { db } from "@/lib/db";

export default async function AdminDashboard() {
  const [totalVendas, receitaAgregada, anunciosOnline, vendasPorAnuncio] = await Promise.all([
    db.venda.count({ where: { status: "PAGO" } }),
    db.transacao.aggregate({ _sum: { valor: true } }),
    db.anuncio.count({ where: { status: "ONLINE" } }),
    db.anuncio.findMany({
      select: {
        id: true,
        titulo: true,
        local: true,
        status: true,
        fotos: {
          select: {
            itensVenda: {
              where: { venda: { status: "PAGO" } },
              select: { preco: true }
            }
          }
        }
      }
    })
  ]);

  const linhas = vendasPorAnuncio.map((a) => {
    const itens = a.fotos.flatMap((f) => f.itensVenda);
    return {
      id: a.id,
      titulo: a.titulo,
      local: a.local,
      status: a.status,
      qtdVendas: itens.length,
      total: itens.reduce((s, i) => s + Number(i.preco), 0)
    };
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Visão geral</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card titulo="Vendas pagas" valor={String(totalVendas)} />
        <Card titulo="Receita total" valor={`R$ ${Number(receitaAgregada._sum.valor ?? 0).toFixed(2).replace(".", ",")}`} />
        <Card titulo="Anúncios online" valor={String(anunciosOnline)} />
      </div>

      <h2 className="mt-10 mb-3 font-display text-sm text-ink">Vendas por anúncio</h2>
      <table className="w-full overflow-hidden rounded-xl bg-white text-sm ring-1 ring-black/5">
        <thead className="bg-ocean text-sand">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Anúncio</th>
            <th className="px-4 py-3 text-left font-medium">Local</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Vendas</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.id} className="border-t border-black/5">
              <td className="px-4 py-3">{l.titulo}</td>
              <td className="px-4 py-3 text-ink/60">{l.local}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    l.status === "ONLINE" ? "bg-aqua/15 text-aqua" : "bg-ink/10 text-ink/50"
                  }`}
                >
                  {l.status === "ONLINE" ? "Online" : "Offline"}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono">{l.qtdVendas}</td>
              <td className="px-4 py-3 text-right font-mono">R$ {l.total.toFixed(2).replace(".", ",")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
      <p className="text-xs uppercase tracking-wide text-ink/50">{titulo}</p>
      <p className="mt-1 font-display text-2xl text-ink">{valor}</p>
    </div>
  );
}
