import Link from "next/link";
import { notFound } from "next/navigation";
import { db, fotoUrl, fotosDo } from "@/lib/db";
import { brl, dataLonga } from "@/lib/format";
import PhotoGrid from "@/components/PhotoGrid";

export default function ProdutoPage({ params }: { params: { id: string } }) {
  const anuncio = db.anuncios.find((a) => a.id === params.id);
  if (!anuncio || anuncio.status === "OFFLINE") notFound();

  const fotos = fotosDo(anuncio.id);

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
            <dd className="tabular font-medium text-ink">{brl(anuncio.precoBase)}</dd>
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
          urlPreview: fotoUrl(f.id, "preview"),
          preco: f.preco
        }))}
      />
    </main>
  );
}
