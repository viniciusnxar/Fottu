import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, novoId } from "@/lib/db";
import { gerarCodigoNumerico } from "@/lib/auth";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ erro: "E-mail inválido" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  let usuario = db.usuarios.find((u) => u.email === email);
  if (!usuario) {
    usuario = { id: novoId(), email, criadoEm: new Date() };
    db.usuarios.push(usuario);
  }

  const codigo = gerarCodigoNumerico();
  db.codigos.push({
    id: novoId(),
    usuarioId: usuario.id,
    codigo,
    expiraEm: new Date(Date.now() + 15 * 60 * 1000),
    usadoEm: null,
    criadoEm: new Date()
  });

  // shortcut: modo offline sem e-mail, o código volta na resposta; envie por e-mail em produção.
  return NextResponse.json({ ok: true, codigoDemo: codigo });
}
