import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, novoId } from "@/lib/db";
import { lerSessao } from "@/lib/auth";

const schema = z.object({ fotoIds: z.array(z.string()).min(1) });

export async function POST(req: NextRequest) {
  const sessao = lerSessao();
  if (!sessao) return NextResponse.json({ erro: "Faça login primeiro" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const fotos = db.fotos.filter((f) => parsed.data.fotoIds.includes(f.id));
  if (fotos.length === 0) return NextResponse.json({ erro: "Fotos não encontradas" }, { status: 404 });

  const venda = {
    id: novoId(),
    usuarioId: sessao.usuarioId,
    valorTotal: fotos.reduce((soma, f) => soma + f.preco, 0),
    status: "PENDENTE" as const,
    itens: fotos.map((f) => ({ fotoId: f.id, preco: f.preco })),
    criadoEm: new Date(),
    pagoEm: null
  };
  db.vendas.push(venda);

  return NextResponse.json({ vendaId: venda.id });
}
