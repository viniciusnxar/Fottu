import Link from "next/link";

type Props = {
  id: string;
  titulo: string;
  local: string;
  data: string; // já formatada, ex: "23 de dez. de 2025"
  precoBase: string; // já formatado, ex: "R$ 10,80"
  qtdFotos: number;
  capaUrl?: string | null;
};

export default function ProductCard({ id, titulo, local, data, precoBase, qtdFotos, capaUrl }: Props) {
  return (
    <Link href={`/produto/${id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-line">
        {capaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capaUrl}
            alt={titulo}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {qtdFotos} fotos
        </span>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="min-w-0 truncate font-medium text-ink group-hover:text-accent">{titulo}</h3>
          <p className="tabular shrink-0 text-sm text-muted">
            a partir de <span className="font-medium text-ink">{precoBase}</span>
          </p>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted">
          {local} · {data}
        </p>
      </div>
    </Link>
  );
}
