import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { gerarUrlDownload } from "@/lib/storage";

export default async function MinhasComprasPage() {
  const sessao = lerSessao();
  if (!sessao) redirect("/login");

  const vendas = await db.venda.findMany({
    where: { usuarioId: sessao.usuarioId, status: "PAGO" },
    include: { itens: { include: { foto: true } } },
    orderBy: { pagoEm: "desc" }
  });

  return (
    <main className="min-h-screen bg-sand px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl text-ink">Minhas compras</h1>

        {vendas.length === 0 ? (
          <p className="mt-4 text-ink/50">Você ainda não tem fotos compradas.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {vendas.map((venda) => (
              <div key={venda.id} className="rounded-xl bg-white p-5 ring-1 ring-black/5">
                <p className="font-mono text-xs text-ink/40">Pedido #{venda.id.slice(-8)}</p>
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {await Promise.all(
                    venda.itens.map(async (item) => {
                      const url = await gerarUrlDownload(item.foto.urlOriginal);
                      return (
                        <a
                          key={item.id}
                          href={url}
                          className="rounded-lg bg-ocean px-3 py-2 text-center font-mono text-xs text-sand hover:bg-ocean/90"
                        >
                          Baixar {item.foto.codigo}
                        </a>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
