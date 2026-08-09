import { db } from "@/lib/db";

export default async function AdminUsuariosPage() {
  const usuarios = await db.usuario.findMany({
    include: { vendas: { where: { status: "PAGO" } } },
    orderBy: { criadoEm: "desc" }
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Usuários</h1>

      <table className="mt-6 w-full overflow-hidden rounded-xl bg-white text-sm ring-1 ring-black/5">
        <thead className="bg-ocean text-sand">
          <tr>
            <th className="px-4 py-3 text-left font-medium">E-mail</th>
            <th className="px-4 py-3 text-left font-medium">Cadastro</th>
            <th className="px-4 py-3 text-right font-medium">Compras</th>
            <th className="px-4 py-3 text-right font-medium">Total gasto</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-t border-black/5">
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3 text-ink/60">
                {new Intl.DateTimeFormat("pt-BR").format(u.criadoEm)}
              </td>
              <td className="px-4 py-3 text-right font-mono">{u.vendas.length}</td>
              <td className="px-4 py-3 text-right font-mono">
                R$ {u.vendas.reduce((s, v) => s + Number(v.valorTotal), 0).toFixed(2).replace(".", ",")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
