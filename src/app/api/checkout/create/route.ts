import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { usuarioAtual } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { criarPix } from "@/lib/pagamento";

const schema = z.object({ fotoIds: z.array(z.string().uuid()).min(1).max(200) });

export async function POST(req: NextRequest) {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "Faça login primeiro" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  // Preço vem do banco, nunca do cliente; só fotos de sessões online.
  const { data: fotos, error } = await db
    .from("fotos")
    .select("id, preco, anuncios!inner(status)")
    .in("id", parsed.data.fotoIds)
    .eq("anuncios.status", "ONLINE");
  if (error) return NextResponse.json({ erro: "Erro ao buscar fotos" }, { status: 500 });
  if (!fotos.length) return NextResponse.json({ erro: "Fotos não encontradas" }, { status: 404 });

  const valor_total = Math.round(fotos.reduce((s, f) => s + Number(f.preco), 0) * 100) / 100;
  const { data: venda, error: e1 } = await db
    .from("vendas")
    .insert({ usuario_id: usuario.id, email: usuario.email, valor_total })
    .select("id")
    .single();
  if (e1) return NextResponse.json({ erro: "Erro ao criar pedido" }, { status: 500 });

  const { error: e2 } = await db.from("itens_venda").insert(fotos.map((f) => ({ venda_id: venda.id, foto_id: f.id, preco: f.preco })));
  try {
    if (e2) throw e2;
    await criarPix({ id: venda.id, email: usuario.email, valor_total });
  } catch (e) {
    console.error("checkout:", e);
    await db.from("vendas").delete().eq("id", venda.id);
    return NextResponse.json({ erro: "Não foi possível gerar o Pix. Tente de novo." }, { status: 502 });
  }

  return NextResponse.json({ vendaId: venda.id });
}
