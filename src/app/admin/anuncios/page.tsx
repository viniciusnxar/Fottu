import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function alternarStatus(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const statusAtual = formData.get("statusAtual") as string;
  await db.anuncio.update({
    where: { id },
    data: { status: statusAtual === "ONLINE" ? "OFFLINE" : "ONLINE" }
  });
  revalidatePath("/admin/anuncios");
  revalidatePath("/"); // reflete no marketplace público também
}

export default async function AdminAnunciosPage() {
  const anuncios = await db.anuncio.findMany({
    include: { _count: { select: { fotos: true } } },
    orderBy: { criadoEm: "desc" }
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Anúncios</h1>
        {/* TODO: link para formulário de criação de novo anúncio + upload de fotos */}
      </div>

      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-sm ring-1 ring-black/5">
        <thead className="bg-ocean text-sand">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Título</th>
            <th className="px-4 py-3 text-left font-medium">Local</th>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-right font-medium">Fotos</th>
            <th className="px-4 py-3 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {anuncios.map((a) => (
            <tr key={a.id} className="border-t border-black/5">
              <td className="px-4 py-3">{a.titulo}</td>
              <td className="px-4 py-3 text-ink/60">{a.local}</td>
              <td className="px-4 py-3 text-ink/60">
                {new Intl.DateTimeFormat("pt-BR").format(a.data)}
              </td>
              <td className="px-4 py-3 text-right font-mono">{a._count.fotos}</td>
              <td className="px-4 py-3 text-right">
                <form action={alternarStatus}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="statusAtual" value={a.status} />
                  <button
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      a.status === "ONLINE"
                        ? "bg-aqua/15 text-aqua hover:bg-aqua/25"
                        : "bg-ink/10 text-ink/50 hover:bg-ink/20"
                    }`}
                  >
                    {a.status === "ONLINE" ? "Online" : "Offline"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
