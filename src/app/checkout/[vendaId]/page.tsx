import { notFound } from "next/navigation";
import { db } from "@/lib/db";

// Página simples de confirmação — em produção, troque pelo QR code retornado
// pelo /api/checkout/create (armazene-o em algum lugar acessível aqui, ex:
// tabela Venda ou um cache de curto prazo) e faça polling do status.
export default async function CheckoutPage({ params }: { params: { vendaId: string } }) {
  const venda = await db.venda.findUnique({
    where: { id: params.vendaId },
    include: { itens: { include: { foto: true } } }
  });

  if (!venda) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <h1 className="font-display text-xl text-ink">Pedido #{venda.id.slice(-8)}</h1>
        <p className="mt-1 text-sm text-ink/60">{venda.itens.length} foto(s)</p>
        <p className="mt-4 font-mono text-2xl text-coral">
          R$ {Number(venda.valorTotal).toFixed(2).replace(".", ",")}
        </p>

        <div className="mt-6 rounded-lg bg-sand p-4">
          {/* TODO: renderizar o QR code base64 retornado pelo Mercado Pago aqui */}
          <p className="text-sm text-ink/60">Escaneie o QR Code Pix para pagar</p>
        </div>

        <p className="mt-4 text-xs text-ink/40">
          Assim que o pagamento for confirmado, você recebe um e-mail com o link para
          download em alta resolução.
        </p>
      </div>
    </main>
  );
}
