import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { svgDemo } from "@/lib/storage";

// Serve o preview (público, com marca d'água) ou o original (só para quem comprou).
export async function GET(_req: NextRequest, { params }: { params: { id: string; tipo: string } }) {
  const foto = db.fotos.find((f) => f.id === params.id);
  if (!foto || !["preview", "original"].includes(params.tipo)) {
    return NextResponse.json({ erro: "Não encontrada" }, { status: 404 });
  }

  if (params.tipo === "preview") {
    return foto.preview
      ? new NextResponse(new Uint8Array(foto.preview), { headers: { "Content-Type": "image/jpeg" } })
      : new NextResponse(svgDemo(foto, true), { headers: { "Content-Type": "image/svg+xml" } });
  }

  const sessao = lerSessao();
  const comprou =
    sessao &&
    db.vendas.some(
      (v) => v.usuarioId === sessao.usuarioId && v.status === "PAGO" && v.itens.some((i) => i.fotoId === foto.id)
    );
  if (!comprou) return NextResponse.json({ erro: "Compra não encontrada" }, { status: 403 });

  const [corpo, tipo, ext] = foto.arquivo
    ? [new Uint8Array(foto.arquivo), "image/jpeg", "jpg"]
    : [svgDemo(foto, false), "image/svg+xml", "svg"];
  return new NextResponse(corpo, {
    headers: {
      "Content-Type": tipo,
      "Content-Disposition": `attachment; filename="${foto.codigo}.${ext}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
