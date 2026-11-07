import "server-only";
import { notFound, redirect } from "next/navigation";
import { db, supabaseSessao } from "@/lib/supabase";

export async function usuarioAtual() {
  const { data } = await supabaseSessao().auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email! } : null;
}

// Admins = e-mails na tabela public.admins (gerenciada pelo painel do Supabase).
export async function ehAdmin(email?: string | null) {
  if (!email) return false;
  const { data } = await db.from("admins").select("email").eq("email", email.toLowerCase()).maybeSingle();
  return !!data;
}

// Usar em toda página, server action e rota do admin (o layout sozinho não protege actions).
export async function exigirAdmin() {
  const u = await usuarioAtual();
  if (!u) redirect("/login?redirect=/admin");
  if (!(await ehAdmin(u.email))) notFound();
  return u;
}
