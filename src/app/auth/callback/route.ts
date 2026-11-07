import { NextRequest, NextResponse } from "next/server";
import { supabaseSessao } from "@/lib/supabase";

// Destino dos links de e-mail (confirmação de cadastro e redefinição de senha).
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/login";
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/login"; // evita redirect aberto

  if (code) {
    const { error } = await supabaseSessao().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(destino, req.url));
  }
  return NextResponse.redirect(new URL("/login?erro=link", req.url));
}
