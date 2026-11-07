import Link from "next/link";
import { notFound } from "next/navigation";
import { db, previewUrl } from "@/lib/supabase";
import { brl, dataLonga } from "@/lib/format";
import { alternarStatus, excluirFoto } from "../../acoes";
import UploadFotos from "./UploadFotos";

export default async function AdminAnuncioPage({ params }: { params: { id: string } }) {
  const { data: anuncio } = await db
    .from("anuncios")
    .select("id, titulo, local, data, preco_base, status, fotos(id, codigo, path_preview, itens_venda(count))")
    .eq("id", params.id)
    .order("codigo", { referencedTable: "fotos" })
    .maybeSingle();
  if (!anuncio) notFound();
  const online = anuncio.status === "ONLINE";

  return (
    <div>
      <Link href="/admin/anuncios" className="text-sm text-muted transition hover:text-ink">
        ← Anúncios
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{anuncio.titulo}</h1>
          <p className="mt-1 text-sm text-muted">
            {anuncio.local} · {dataLonga(anuncio.data)} · {brl(anuncio.preco_base)} por foto
          </p>
        </div>
        <div className="flex gap-2">
          {online && (
            <Link href={`/produto/${anuncio.id}`} className="btn-secondary">
              Ver no site
            </Link>
          )}
          <form action={alternarStatus}>
            <input type="hidden" name="id" value={anuncio.id} />
            <button className={online ? "btn-secondary" : "btn-primary"} disabled={!online && anuncio.fotos.length === 0}>
              {online ? "Tirar do ar" : "Colocar online"}
            </button>
          </form>
        </div>
      </div>

      <UploadFotos anuncioId={anuncio.id} />

      <h2 className="mb-3 mt-10 text-sm font-semibold text-ink">
        Fotos <span className="tabular font-normal text-muted">({anuncio.fotos.length})</span>
      </h2>
      {anuncio.fotos.length === 0 ? (
        <p className="panel px-6 py-12 text-center text-sm text-muted">Nenhuma foto enviada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {anuncio.fotos.map((f) => {
            const vendida = (f.itens_venda[0]?.count ?? 0) > 0;
            return (
              <div key={f.id} className="overflow-hidden rounded-xl ring-1 ring-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl(f.path_preview)} alt={`Foto ${f.codigo}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="tabular text-muted">{f.codigo}</span>
                  {vendida ? (
                    <span className="text-xs font-medium text-success">Vendida</span>
                  ) : (
                    <form action={excluirFoto}>
                      <input type="hidden" name="id" value={f.id} />
                      <button className="text-xs font-medium text-red-700 hover:underline" aria-label={`Excluir foto ${f.codigo}`}>
                        Excluir
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
