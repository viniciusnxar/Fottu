import { NextRequest, NextResponse } from "next/server";
import { db, novoId } from "@/lib/db";
import { processarUploadFoto } from "@/lib/storage";

// TODO: proteger esta rota com autenticação de admin antes de ir pra produção
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const anuncioId = form.get("anuncioId") as string;
  const codigo = form.get("codigo") as string;
  const preco = Number(form.get("preco"));
  const arquivo = form.get("arquivo") as File | null;

  if (!anuncioId || !codigo || !preco || !arquivo) {
    return NextResponse.json({ erro: "Campos obrigatórios faltando" }, { status: 400 });
  }
  if (!db.anuncios.some((a) => a.id === anuncioId)) {
    return NextResponse.json({ erro: "Anúncio não encontrado" }, { status: 404 });
  }

  const { arquivo: original, preview } = await processarUploadFoto(Buffer.from(await arquivo.arrayBuffer()));

  const foto = {
    id: novoId(),
    anuncioId,
    codigo,
    preco,
    ordem: db.fotos.filter((f) => f.anuncioId === anuncioId).length,
    matiz: 0,
    arquivo: original,
    preview
  };
  db.fotos.push(foto);

  return NextResponse.json({ foto: { id: foto.id, codigo, preco } });
}
