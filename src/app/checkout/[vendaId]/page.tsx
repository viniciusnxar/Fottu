import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { db, previewUrl } from "@/lib/supabase";
import { brl } from "@/lib/format";
import PixPendente from "./PixPendente";

type Item = { preco: number; fotos: { id: string; codigo: string; path_preview: string } };

export default async function CheckoutPage({ params }: { params: { vendaId: string } }) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect(`/login?redirect=/checkout/${params.vendaId}`);

  const { data: venda } = await db
    .from("vendas")
    .select("id, status, valor_total, pix_qr, pix_qr_base64, expira_em, itens_venda(preco, fotos(id, codigo, path_preview))")
    .eq("id", params.vendaId)
    .eq("usuario_id", usuario.id)
    .maybeSingle();
  if (!venda) notFound();

  const itens = venda.itens_venda as unknown as Item[];
  const pago = venda.status === "PAGO";
  const encerrado = venda.status === "CANCELADO" || venda.status === "EXPIRADO";

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-[1fr_380px]">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          {pago ? "Pagamento confirmado" : encerrado ? "Pedido encerrado" : "Finalize sua compra"}
        </h1>
        <p className="tabular mt-2 text-sm text-muted">Pedido #{venda.id.slice(-8)}</p>

        <ul className="panel mt-8 divide-y divide-line">
          {itens.map((item) => (
            <li key={item.fotos.id} className="flex items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl(item.fotos.path_preview)} alt="" className="h-14 w-20 rounded-lg object-cover" />
              <span className="tabular flex-1 text-sm font-medium text-ink">Foto {item.fotos.codigo}</span>
              <span className="tabular text-sm text-ink">{brl(item.preco)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between p-4">
            <span className="text-sm font-medium text-ink">Total</span>
            <span className="tabular text-lg font-semibold text-ink">{brl(venda.valor_total)}</span>
          </li>
        </ul>
      </section>

      <aside className="panel h-fit p-6 shadow-soft lg:sticky lg:top-24">
        {pago ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-success">
              <svg aria-hidden viewBox="0 0 16 16" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-4 font-medium text-ink">Suas fotos estão prontas.</p>
            <p className="mt-1 text-sm text-muted">Os originais em alta resolução já podem ser baixados.</p>
            <Link href="/minhas-compras" className="btn-primary mt-6 w-full">
              Baixar minhas fotos
            </Link>
          </div>
        ) : encerrado ? (
          <div className="text-center">
            <p className="font-medium text-ink">Este Pix expirou ou foi cancelado.</p>
            <p className="mt-1 text-sm text-muted">Nenhum valor foi cobrado. Selecione as fotos de novo para gerar outro Pix.</p>
            <Link href="/" className="btn-primary mt-6 w-full">
              Voltar às sessões
            </Link>
          </div>
        ) : (
          <PixPendente
            vendaId={venda.id}
            valor={brl(venda.valor_total)}
            qr={venda.pix_qr}
            qrBase64={venda.pix_qr_base64}
            expiraEm={venda.expira_em}
          />
        )}
      </aside>
    </main>
  );
}
