import { NextRequest, NextResponse } from "next/server";
import { sincronizarPagamento } from "@/lib/pagamento";

// Notificação do Mercado Pago. Não confiamos no corpo: o pagamento é reconsultado na API do MP
// pelo id, então uma notificação forjada só consegue disparar uma sincronização inofensiva.
export async function POST(req: NextRequest) {
  const corpo = await req.json().catch(() => ({}));
  const id = corpo?.data?.id ?? req.nextUrl.searchParams.get("data.id") ?? req.nextUrl.searchParams.get("id");
  const tipo = corpo?.type ?? req.nextUrl.searchParams.get("type") ?? req.nextUrl.searchParams.get("topic");

  if (id && tipo === "payment") {
    try {
      await sincronizarPagamento(String(id));
    } catch (e) {
      console.error("webhook mercadopago:", e);
      return NextResponse.json({ ok: false }, { status: 500 }); // MP reenvia
    }
  }
  return NextResponse.json({ ok: true });
}
