import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db, fotoUrl } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { brl } from "@/lib/format";
import PagarButton from "./PagarButton";

export default function CheckoutPage({ params }: { params: { vendaId: string } }) {
  const sessao = lerSessao();
  if (!sessao) redirect(`/login?redirect=/checkout/${params.vendaId}`);

  const venda = db.vendas.find((v) => v.id === params.vendaId && v.usuarioId === sessao.usuarioId);
  if (!venda) notFound();

  const itens = venda.itens.map((i) => ({ ...i, foto: db.fotos.find((f) => f.id === i.fotoId)! }));
  const pago = venda.status === "PAGO";

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-[1fr_380px]">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          {pago ? "Pagamento confirmado" : "Finalize sua compra"}
        </h1>
        <p className="tabular mt-2 text-sm text-muted">Pedido #{venda.id.slice(-8)}</p>

        <ul className="panel mt-8 divide-y divide-line">
          {itens.map((item) => (
            <li key={item.fotoId} className="flex items-center gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fotoUrl(item.fotoId, "preview")} alt="" className="h-14 w-20 rounded-lg object-cover" />
              <span className="tabular flex-1 text-sm font-medium text-ink">Foto {item.foto.codigo}</span>
              <span className="tabular text-sm text-ink">{brl(item.preco)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between p-4">
            <span className="text-sm font-medium text-ink">Total</span>
            <span className="tabular text-lg font-semibold text-ink">{brl(venda.valorTotal)}</span>
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
        ) : (
          <>
            <h2 className="font-medium text-ink">Pague com Pix</h2>
            <p className="mt-1 text-sm text-muted">Escaneie o QR Code no app do seu banco.</p>
            <div className="mt-5 rounded-xl bg-canvas p-5 ring-1 ring-line">
              <QrSimulado semente={venda.id} />
              <p className="mt-3 text-center text-xs text-muted">QR Code simulado (modo offline)</p>
            </div>
            <p className="tabular mt-5 text-center text-2xl font-semibold text-ink">{brl(venda.valorTotal)}</p>
            <PagarButton vendaId={venda.id} />
          </>
        )}
      </aside>
    </main>
  );
}

// Padrão de QR ilustrativo e determinístico — não é um Pix válido
function QrSimulado({ semente }: { semente: string }) {
  const n = 25;
  let h = [...semente].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
  const celulas: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      const canto = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
      if (!canto && h % 2) celulas.push([x, y]);
    }
  const marcador = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#18181b" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#18181b" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="mx-auto aspect-square w-44 rounded bg-white" shapeRendering="crispEdges" aria-label="QR Code Pix simulado" role="img">
      {celulas.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="#18181b" />
      ))}
      {[marcador(0, 0), marcador(n - 7, 0), marcador(0, n - 7)]}
    </svg>
  );
}
