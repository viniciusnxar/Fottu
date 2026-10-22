import Link from "next/link";
import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/auth";
import { db, fotoUrl } from "@/lib/db";
import { brl, dataCurta } from "@/lib/format";

export default function MinhasComprasPage() {
  const sessao = lerSessao();
  if (!sessao) redirect("/login?redirect=/minhas-compras");

  const vendas = db.vendas
    .filter((v) => v.usuarioId === sessao.usuarioId && v.status === "PAGO")
    .sort((a, b) => b.pagoEm!.getTime() - a.pagoEm!.getTime());

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Minhas compras</h1>
      <p className="mt-2 text-sm text-muted">Baixe os originais em alta resolução sempre que precisar.</p>

      {vendas.length === 0 ? (
        <div className="panel mt-8 px-6 py-16 text-center">
          <p className="font-medium text-ink">Você ainda não comprou fotos.</p>
          <p className="mt-1 text-sm text-muted">Encontre a sua sessão e selecione as fotos em que você aparece.</p>
          <Link href="/" className="btn-primary mt-6">
            Ver sessões
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {vendas.map((venda) => (
            <section key={venda.id} className="panel p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="tabular text-sm font-medium text-ink">Pedido #{venda.id.slice(-8)}</p>
                <p className="tabular text-sm text-muted">
                  {dataCurta(venda.pagoEm!)} · {brl(venda.valorTotal)}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {venda.itens.map((item) => {
                  const foto = db.fotos.find((f) => f.id === item.fotoId)!;
                  return (
                    <a
                      key={item.fotoId}
                      href={fotoUrl(foto.id, "original")}
                      download
                      className="group overflow-hidden rounded-xl ring-1 ring-line transition hover:shadow-lift"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fotoUrl(foto.id, "preview")} alt={`Foto ${foto.codigo}`} className="aspect-[4/3] w-full object-cover" />
                      <span className="flex items-center justify-between px-3 py-2.5 text-sm">
                        <span className="tabular text-muted">{foto.codigo}</span>
                        <span className="font-medium text-accent group-hover:underline">Baixar</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
