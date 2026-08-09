import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PhotoGrid from "@/components/PhotoGrid";

export default async function ProdutoPage({ params }: { params: { id: string } }) {
  const anuncio = await db.anuncio.findUnique({
    where: { id: params.id },
    include: { fotos: { orderBy: { ordem: "asc" } } }
  });

  if (!anuncio || anuncio.status === "OFFLINE") notFound();

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(anuncio.data);

  return (
    <main className="min-h-screen bg-sand">
      <section className="border-b border-ocean/10 bg-ocean px-6 py-10 text-sand">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-widest text-aqua">{anuncio.local}</p>
          <h1 className="mt-1 font-display text-3xl">{anuncio.titulo}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-sand/70">
            <span>{dataFormatada}</span>
            {anuncio.fotografo && <span>Fotógrafo: {anuncio.fotografo}</span>}
            <span>{anuncio.fotos.length} fotos disponíveis</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <p className="mb-4 text-sm text-ink/60">
          Clique nas fotos para selecionar. As prévias têm marca d&apos;água e resolução
          reduzida — após a compra você recebe o arquivo original em alta qualidade.
        </p>
        <PhotoGrid
          fotos={anuncio.fotos.map((f) => ({
            id: f.id,
            codigo: f.codigo,
            urlPreview: f.urlPreview,
            preco: Number(f.preco)
          }))}
        />
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
          <h2 className="font-display text-sm text-ink">Dúvidas sobre esta sessão?</h2>
          <p className="mt-1 text-sm text-ink/60">
            Fale com a gente pelo WhatsApp ou e-mail — respondemos em até 1 dia útil.
          </p>
          {/* TODO: trocar pelos contatos reais */}
          <p className="mt-2 font-mono text-sm text-aqua">contato@seudominio.com.br</p>
        </div>
      </section>
    </main>
  );
}
