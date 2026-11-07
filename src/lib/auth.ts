import "server-only";
import { notFound, redirect } from "next/navigation";
import { db, supabaseSessao } from "@/lib/supabase";

// Conta logada E aprovada no banco. Conta não aprovada é tratada como deslogada em todo o site,
// então revogar a aprovação corta o acesso na hora (compra, download, admin).
export async function usuarioAtual() {
  const { data } = await supabaseSessao().auth.getUser();
  if (!data.user) return null;
  return (await estaAprovado(data.user.id)) ? { id: data.user.id, email: data.user.email! } : null;
}

export async function estaAprovado(usuarioId: string) {
  const { data } = await db.from("perfis").select("aprovado").eq("id", usuarioId).maybeSingle();
  return data?.aprovado === true;
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
