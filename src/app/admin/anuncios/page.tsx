import Link from "next/link";
import { db, previewUrl } from "@/lib/supabase";
import { brl, dataCurta } from "@/lib/format";
import { alternarStatus } from "../acoes";

export default async function AdminAnunciosPage() {
  const { data, error } = await db
    .from("anuncios")
    .select("id, titulo, local, data, preco_base, status, capa:fotos(path_preview), total:fotos(count)")
    .order("criado_em", { ascending: false })
    .order("codigo", { referencedTable: "capa" })
    .limit(1, { referencedTable: "capa" });
  if (error) throw error;
  const anuncios = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Anúncios</h1>
        <Link href="/admin/anuncios/novo" className="btn-primary">
          Nova sessão
        </Link>
      </div>

      <div className="panel mt-6 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Sessão</th>
              <th>Data</th>
              <th className="!text-right">Preço</th>
              <th className="!text-right">Fotos</th>
              <th className="!text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {anuncios.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  Nenhuma sessão ainda. Crie a primeira e envie as fotos.
                </td>
              </tr>
            )}
            {anuncios.map((a) => {
              const online = a.status === "ONLINE";
              return (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/anuncios/${a.id}`} className="group flex items-center gap-3">
                      {a.capa[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl(a.capa[0].path_preview)} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
                      ) : (
                        <span className="h-10 w-14 shrink-0 rounded-md bg-line" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink group-hover:text-accent">{a.titulo}</p>
                        <p className="truncate text-xs text-muted">{a.local}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap text-muted">{dataCurta(a.data)}</td>
                  <td className="tabular text-right">{brl(a.preco_base)}</td>
                  <td className="tabular text-right">{a.total[0]?.count ?? 0}</td>
                  <td className="text-right">
                    <form action={alternarStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        role="switch"
                        aria-checked={online}
                        aria-label={`${a.titulo}: ${online ? "online" : "offline"}`}
                        className="inline-flex items-center gap-2 text-xs font-medium text-muted"
                      >
                        {online ? "Online" : "Offline"}
                        <span className={`relative h-5 w-9 rounded-full transition ${online ? "bg-success" : "bg-line"}`}>
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${online ? "left-[18px]" : "left-0.5"}`} />
                        </span>
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
