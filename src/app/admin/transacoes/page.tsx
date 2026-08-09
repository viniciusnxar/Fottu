import { db } from "@/lib/db";

export default async function AdminTransacoesPage() {
  const transacoes = await db.transacao.findMany({
    include: { venda: { include: { usuario: true } } },
    orderBy: { criadoEm: "desc" },
    take: 200
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Transações</h1>

      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-sm ring-1 ring-black/5">
        <thead className="bg-ocean text-sand">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-left font-medium">Comprador</th>
            <th className="px-4 py-3 text-left font-medium">Método</th>
            <th className="px-4 py-3 text-left font-medium">Pedido</th>
            <th className="px-4 py-3 text-right font-medium">Valor</th>
          </tr>
        </thead>
        <tbody>
          {transacoes.map((t) => (
            <tr key={t.id} className="border-t border-black/5">
              <td className="px-4 py-3 text-ink/60">
                {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(t.criadoEm)}
              </td>
              <td className="px-4 py-3">{t.venda.usuario.email}</td>
              <td className="px-4 py-3 uppercase text-ink/60">{t.metodo}</td>
              <td className="px-4 py-3 font-mono text-xs text-ink/50">#{t.vendaId.slice(-8)}</td>
              <td className="px-4 py-3 text-right font-mono">
                R$ {Number(t.valor).toFixed(2).replace(".", ",")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
