import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { criarSessao } from "@/lib/auth";

const schema = z.object({ email: z.string().email(), codigo: z.string().length(6) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }
  const { email, codigo } = parsed.data;

  const usuario = await db.usuario.findUnique({ where: { email } });
  if (!usuario) return NextResponse.json({ erro: "Código inválido" }, { status: 401 });

  const registro = await db.codigoLogin.findFirst({
    where: { usuarioId: usuario.id, codigo, usadoEm: null, expiraEm: { gt: new Date() } },
    orderBy: { criadoEm: "desc" }
  });

  if (!registro) {
    return NextResponse.json({ erro: "Código inválido ou expirado" }, { status: 401 });
  }

  await db.codigoLogin.update({ where: { id: registro.id }, data: { usadoEm: new Date() } });
  criarSessao(usuario.id, usuario.email);

  return NextResponse.json({ ok: true });
}
