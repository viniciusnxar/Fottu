import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, novoId } from "@/lib/db";
import { lerSessao } from "@/lib/auth";

const schema = z.object({ vendaId: z.string() });

// Simula a confirmação do Pix (no lugar do webhook do Mercado Pago) para o modo offline.
export async function POST(req: NextRequest) {
  const sessao = lerSessao();
  if (!sessao) return NextResponse.json({ erro: "Faça login primeiro" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const venda = db.vendas.find((v) => v.id === parsed.data.vendaId && v.usuarioId === sessao.usuarioId);
  if (!venda) return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });

  if (venda.status === "PENDENTE") {
    venda.status = "PAGO";
    venda.pagoEm = new Date();
    db.transacoes.push({ id: novoId(), vendaId: venda.id, metodo: "pix", valor: venda.valorTotal, criadoEm: new Date() });
  }

  return NextResponse.json({ ok: true, status: venda.status });
}
