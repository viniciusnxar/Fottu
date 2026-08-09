import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/lib/db";
import { lerSessao } from "@/lib/auth";

const schema = z.object({ fotoIds: z.array(z.string()).min(1) });

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(req: NextRequest) {
  const sessao = lerSessao();
  if (!sessao) return NextResponse.json({ erro: "Faça login primeiro" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const fotos = await db.foto.findMany({ where: { id: { in: parsed.data.fotoIds } } });
  if (fotos.length === 0) return NextResponse.json({ erro: "Fotos não encontradas" }, { status: 404 });

  const valorTotal = fotos.reduce((soma, f) => soma + Number(f.preco), 0);

  const venda = await db.venda.create({
    data: {
      usuarioId: sessao.usuarioId,
      valorTotal,
      status: "PENDENTE",
      gateway: "MERCADO_PAGO",
      itens: {
        create: fotos.map((f) => ({ fotoId: f.id, preco: f.preco }))
      }
    }
  });

  // Cria o pagamento Pix no Mercado Pago
  const payment = new Payment(mpClient);
  const pagamento = await payment.create({
    body: {
      transaction_amount: valorTotal,
      description: `Pedido #${venda.id} — Marketplace de Fotos`,
      payment_method_id: "pix",
      payer: { email: sessao.email },
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago`,
      external_reference: venda.id
    }
  });

  await db.venda.update({
    where: { id: venda.id },
    data: { idPagamentoExterno: String(pagamento.id) }
  });

  return NextResponse.json({
    vendaId: venda.id,
    qrCode: pagamento.point_of_interaction?.transaction_data?.qr_code,
    qrCodeBase64: pagamento.point_of_interaction?.transaction_data?.qr_code_base64
  });
}
