import { db, previewUrl } from "@/lib/supabase";
import { brl, dataCurta } from "@/lib/format";
import ProductCard from "@/components/ProductCard";

export default async function HomePage({ searchParams }: { searchParams: { q?: string } }) {
  // Remove caracteres que têm significado no filtro do PostgREST
  const q = (searchParams.q ?? "").replace(/[,()%*\\:"]/g, " ").trim();
  let consulta = db
    .from("anuncios")
    .select("id, titulo, local, data, preco_base, capa:fotos(path_preview), total:fotos(count)")
    .eq("status", "ONLINE")
    .order("data", { ascending: false })
    .order("codigo", { referencedTable: "capa" })
    .limit(1, { referencedTable: "capa" });
  if (q) consulta = consulta.or(`titulo.ilike.*${q}*,local.ilike.*${q}*`);
  const { data, error } = await consulta;
  if (error) throw error;
  const anuncios = data ?? [];

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
        <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
          Encontre suas fotos.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-lg text-muted">
          Escolha a sessão em que você foi fotografado, veja as prévias e baixe os originais em alta
          resolução logo após o pagamento via Pix.
        </p>

        <form action="/" className="mt-8 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">
            Buscar sessão
          </label>
          <input id="q" name="q" defaultValue={searchParams.q} placeholder="Busque por evento ou local" className="input rounded-full px-5" />
          <button className="btn-primary shrink-0">Buscar</button>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between border-t border-line pt-8">
          <h2 className="text-lg font-semibold text-ink">{q ? `Resultados para “${searchParams.q}”` : "Sessões recentes"}</h2>
          <p className="tabular text-sm text-muted">{anuncios.length} sessões</p>
        </div>

        {anuncios.length === 0 ? (
          <div className="panel px-6 py-16 text-center">
            <p className="font-medium text-ink">Nenhuma sessão encontrada.</p>
            <p className="mt-1 text-sm text-muted">Tente outro nome de evento ou local.</p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {anuncios.map((a) => (
              <ProductCard
                key={a.id}
                id={a.id}
                titulo={a.titulo}
                local={a.local}
                data={dataCurta(a.data)}
                precoBase={brl(a.preco_base)}
                qtdFotos={a.total[0]?.count ?? 0}
                capaUrl={a.capa[0] && previewUrl(a.capa[0].path_preview)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
