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
  const { codigo } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const usuario = db.usuarios.find((u) => u.email === email);
  if (!usuario) return NextResponse.json({ erro: "Código inválido" }, { status: 401 });

  const registro = db.codigos
    .filter((c) => c.usuarioId === usuario.id && c.codigo === codigo && !c.usadoEm && c.expiraEm > new Date())
    .at(-1);

  if (!registro) {
    return NextResponse.json({ erro: "Código inválido ou expirado" }, { status: 401 });
  }

  registro.usadoEm = new Date();
  criarSessao(usuario.id, usuario.email);

  return NextResponse.json({ ok: true });
}
