import Link from "next/link";
import { notFound } from "next/navigation";
import { db, previewUrl } from "@/lib/supabase";
import { brl, dataLonga } from "@/lib/format";
import PhotoGrid from "@/components/PhotoGrid";

export default async function ProdutoPage({ params }: { params: { id: string } }) {
  const { data: anuncio } = await db
    .from("anuncios")
    .select("id, titulo, local, data, preco_base, fotografo, fotos(id, codigo, path_preview, preco)")
    .eq("id", params.id)
    .eq("status", "ONLINE")
    .order("codigo", { referencedTable: "fotos" })
    .maybeSingle();
  if (!anuncio) notFound();

  const fotos = anuncio.fotos;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
      <Link href="/" className="text-sm text-muted transition hover:text-ink">
        ← Todas as sessões
      </Link>

      <header className="mb-10 mt-6">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{anuncio.titulo}</h1>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">Local</dt>
            <dd className="font-medium text-ink">{anuncio.local}</dd>
          </div>
          <div>
            <dt className="text-muted">Data</dt>
            <dd className="font-medium text-ink">{dataLonga(anuncio.data)}</dd>
          </div>
          <div>
            <dt className="text-muted">Fotos</dt>
            <dd className="tabular font-medium text-ink">{fotos.length}</dd>
          </div>
          <div>
            <dt className="text-muted">Preço por foto</dt>
            <dd className="tabular font-medium text-ink">{brl(anuncio.preco_base)}</dd>
          </div>
          {anuncio.fotografo && (
            <div>
              <dt className="text-muted">Fotógrafo</dt>
              <dd className="font-medium text-ink">{anuncio.fotografo}</dd>
            </div>
          )}
        </dl>
        <p className="mt-6 max-w-2xl text-sm text-muted">
          As prévias têm marca d&apos;água e resolução reduzida. Depois do pagamento você baixa o arquivo
          original, sem marca, em alta qualidade.
        </p>
      </header>

      <PhotoGrid
        fotos={fotos.map((f) => ({
          id: f.id,
          codigo: f.codigo,
          urlPreview: previewUrl(f.path_preview),
          preco: Number(f.preco)
        }))}
      />
    </main>
  );
}
