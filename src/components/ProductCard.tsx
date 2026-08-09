import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  titulo: string;
  local: string;
  data: string; // já formatada, ex: "23 dez 2025"
  precoBase: string; // já formatada, ex: "10,80"
  capaUrl?: string | null;
};

// Cartão em formato de "ticket": foto no topo, linha perfurada, dados embaixo —
// eco direto do recibo de venda que inspirou o produto.
export default function ProductCard({ id, titulo, local, data, precoBase, capaUrl }: Props) {
  return (
    <Link
      href={`/produto/${id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ocean">
        {capaUrl ? (
          <Image
            src={capaUrl}
            alt={titulo}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sand/40 font-display text-sm">
            SEM CAPA
          </div>
        )}
        {/* Selo diagonal, referência às linhas de quadra */}
        <div className="absolute left-3 top-3 rotate-[-8deg] rounded bg-ocean/80 px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-sand">
          {local}
        </div>
      </div>

      {/* Linha perfurada — a marca registrada visual do "ticket" */}
      <div className="relative h-3 bg-white">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 border-t-2 border-dashed border-ocean/15" />
      </div>

      <div className="space-y-1 px-4 pb-4">
        <h3 className="font-display text-base leading-tight text-ink">{titulo}</h3>
        <p className="text-sm text-ink/60">{data}</p>
        <p className="pt-1 font-mono text-lg font-medium text-coral">R$ {precoBase}</p>
      </div>
    </Link>
  );
}
