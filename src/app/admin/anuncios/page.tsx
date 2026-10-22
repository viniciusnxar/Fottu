import { revalidatePath } from "next/cache";
import { db, capaDe, fotoUrl, fotosDo } from "@/lib/db";
import { dataCurta } from "@/lib/format";

async function alternarStatus(formData: FormData) {
  "use server";
  const anuncio = db.anuncios.find((a) => a.id === formData.get("id"));
  if (anuncio) anuncio.status = anuncio.status === "ONLINE" ? "OFFLINE" : "ONLINE";
  revalidatePath("/admin/anuncios");
  revalidatePath("/"); // reflete no marketplace público também
}

export default function AdminAnunciosPage() {
  const anuncios = [...db.anuncios].sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Anúncios</h1>
        {/* TODO: link para formulário de criação de novo anúncio + upload de fotos */}
      </div>

      <div className="panel mt-6 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Sessão</th>
              <th>Data</th>
              <th className="!text-right">Fotos</th>
              <th className="!text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {anuncios.map((a) => {
              const capa = capaDe(a.id);
              const online = a.status === "ONLINE";
              return (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {capa && <img src={fotoUrl(capa.id, "preview")} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{a.titulo}</p>
                        <p className="truncate text-xs text-muted">{a.local}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-muted">{dataCurta(a.data)}</td>
                  <td className="tabular text-right">{fotosDo(a.id).length}</td>
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
