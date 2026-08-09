import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { gerarCodigoNumerico } from "@/lib/auth";
import { enviarCodigoLogin } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: "E-mail inválido" }, { status: 400 });
  }
  const { email } = parsed.data;

  const usuario = await db.usuario.upsert({
    where: { email },
    update: {},
    create: { email }
  });

  const codigo = gerarCodigoNumerico();
  await db.codigoLogin.create({
    data: {
      usuarioId: usuario.id,
      codigo,
      expiraEm: new Date(Date.now() + 15 * 60 * 1000)
    }
  });

  await enviarCodigoLogin(email, codigo);

  return NextResponse.json({ ok: true });
}
