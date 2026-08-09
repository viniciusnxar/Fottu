import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/lib/db";
import { enviarConfirmacaoCompra } from "@/lib/email";

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

// O Mercado Pago chama essa rota quando o status de um pagamento muda.
// Documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type !== "payment") return NextResponse.json({ ok: true });

  const payment = new Payment(mpClient);
  const pagamento = await payment.get({ id: body.data.id });

  const vendaId = pagamento.external_reference;
  if (!vendaId) return NextResponse.json({ ok: true });

  if (pagamento.status === "approved") {
    const venda = await db.venda.update({
      where: { id: vendaId },
      data: { status: "PAGO", pagoEm: new Date() },
      include: { usuario: true, itens: true }
    });

    await db.transacao.create({
      data: {
        vendaId: venda.id,
        metodo: "pix",
        valor: venda.valorTotal,
        idExternoGateway: String(pagamento.id)
      }
    });

    await enviarConfirmacaoCompra(venda.usuario.email, {
      vendaId: venda.id,
      valorTotal: venda.valorTotal.toFixed(2),
      linkMinhasCompras: `${process.env.NEXT_PUBLIC_SITE_URL}/minhas-compras`
    });
  } else if (["rejected", "cancelled"].includes(pagamento.status ?? "")) {
    await db.venda.update({ where: { id: vendaId }, data: { status: "CANCELADO" } });
  }

  return NextResponse.json({ ok: true });
}
