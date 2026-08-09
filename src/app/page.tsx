import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60; // regenera a lista a cada 60s

export default async function HomePage() {
  const anuncios = await db.anuncio.findMany({
    where: { status: "ONLINE" },
    orderBy: { data: "desc" }
  });

  return (
    <main className="min-h-screen bg-sand">
      {/* Hero — o "campo" onde tudo acontece */}
      <section className="border-b border-ocean/10 bg-ocean px-6 py-16 text-sand sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-aqua">
            Suas fotos, seu dia na areia
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
            Encontre o momento em que você voou pela bola.
          </h1>
          <p className="mt-4 max-w-md text-sand/70">
            Fotos em alta resolução dos seus jogos de futevôlei e vôlei de praia,
            organizadas por dia e por praia. Prévia grátis, compra na hora.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="mb-6 font-display text-xl text-ink">Sessões disponíveis</h2>

        {anuncios.length === 0 ? (
          <p className="text-ink/50">Nenhuma sessão publicada no momento.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {anuncios.map((a) => (
              <ProductCard
                key={a.id}
                id={a.id}
                titulo={a.titulo}
                local={a.local}
                data={new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(a.data)}
                precoBase={Number(a.precoBase).toFixed(2).replace(".", ",")}
                capaUrl={a.capaUrl}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
