import { NextRequest, NextResponse } from "next/server";
import { usuarioAtual } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { sincronizarPagamento } from "@/lib/pagamento";

// Polling do checkout: confirma o Pix mesmo se o webhook não chegar (ex.: rodando em localhost).
export async function GET(req: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "Faça login primeiro" }, { status: 401 });

  const { data: venda } = await db
    .from("vendas")
    .select("status, mp_payment_id")
    .eq("id", req.nextUrl.searchParams.get("vendaId") ?? "")
    .eq("usuario_id", usuario.id)
    .maybeSingle();
  if (!venda) return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });

  const status = venda.status === "PENDENTE" && venda.mp_payment_id ? await sincronizarPagamento(venda.mp_payment_id) : venda.status;
  return NextResponse.json({ status: status ?? venda.status });
}
