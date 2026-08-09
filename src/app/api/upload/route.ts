import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processarUploadFoto } from "@/lib/storage";

// TODO: proteger esta rota com autenticação de admin antes de ir pra produção
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const anuncioId = form.get("anuncioId") as string;
  const codigo = form.get("codigo") as string;
  const preco = form.get("preco") as string;
  const arquivo = form.get("arquivo") as File | null;

  if (!anuncioId || !codigo || !preco || !arquivo) {
    return NextResponse.json({ erro: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const { keyOriginal, urlPreview } = await processarUploadFoto({ buffer, anuncioId, codigo });

  const foto = await db.foto.create({
    data: {
      anuncioId,
      codigo,
      preco: Number(preco),
      urlPreview,
      urlOriginal: keyOriginal
    }
  });

  return NextResponse.json({ foto });
}
