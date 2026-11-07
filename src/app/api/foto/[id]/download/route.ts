import { NextRequest, NextResponse } from "next/server";
import { usuarioAtual } from "@/lib/auth";
import { db } from "@/lib/supabase";

// Original em alta: só para quem tem pedido PAGO com a foto. Redireciona para URL assinada curta.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.redirect(new URL(`/login?redirect=/minhas-compras`, req.url));

  const { data: item } = await db
    .from("itens_venda")
    .select("fotos(codigo, path_original), vendas!inner(usuario_id, status)")
    .eq("foto_id", params.id)
    .eq("vendas.usuario_id", usuario.id)
    .eq("vendas.status", "PAGO")
    .limit(1)
    .maybeSingle();
  const foto = item?.fotos as unknown as { codigo: string; path_original: string } | null;
  if (!foto) return NextResponse.json({ erro: "Compra não encontrada" }, { status: 403 });

  const ext = foto.path_original.split(".").pop();
  const { data, error } = await db.storage
    .from("originais")
    .createSignedUrl(foto.path_original, 60, { download: `${foto.codigo}.${ext}` });
  if (error) return NextResponse.json({ erro: "Arquivo indisponível" }, { status: 500 });

  return NextResponse.redirect(data.signedUrl);
}
