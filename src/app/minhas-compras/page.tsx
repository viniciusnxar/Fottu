import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { db, previewUrl } from "@/lib/supabase";
import { brl, dataCurta } from "@/lib/format";

type Item = { fotos: { id: string; codigo: string; path_preview: string } };

export default async function MinhasComprasPage() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/login?redirect=/minhas-compras");

  const { data, error } = await db
    .from("vendas")
    .select("id, valor_total, pago_em, itens_venda(fotos(id, codigo, path_preview))")
    .eq("usuario_id", usuario.id)
    .eq("status", "PAGO")
    .order("pago_em", { ascending: false });
  if (error) throw error;
  const vendas = data ?? [];

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
                  {dataCurta(venda.pago_em!)} · {brl(venda.valor_total)}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {(venda.itens_venda as unknown as Item[]).map(({ fotos: foto }) => (
                  <a
                    key={foto.id}
                    href={`/api/foto/${foto.id}/download`}
                    className="group overflow-hidden rounded-xl ring-1 ring-line transition hover:shadow-lift"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl(foto.path_preview)} alt={`Foto ${foto.codigo}`} className="aspect-[4/3] w-full object-cover" />
                    <span className="flex items-center justify-between px-3 py-2.5 text-sm">
                      <span className="tabular text-muted">{foto.codigo}</span>
                      <span className="font-medium text-accent group-hover:underline">Baixar</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
