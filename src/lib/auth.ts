import "server-only";
import { notFound, redirect } from "next/navigation";
import { db, supabaseSessao } from "@/lib/supabase";

async function perfil(usuarioId: string) {
  const { data } = await db.from("perfis").select("aprovado, is_admin").eq("id", usuarioId).maybeSingle();
  return data;
}

// Conta logada E aprovada no banco. Conta não aprovada é tratada como deslogada em todo o site,
// então revogar a aprovação corta o acesso na hora (compra, download, admin).
// `admin` vem de perfis.is_admin, que só muda pelo banco.
export async function usuarioAtual() {
  const { data } = await supabaseSessao().auth.getUser();
  if (!data.user) return null;
  const p = await perfil(data.user.id);
  return p?.aprovado ? { id: data.user.id, email: data.user.email!, admin: p.is_admin === true } : null;
}

export async function estaAprovado(usuarioId: string) {
  return (await perfil(usuarioId))?.aprovado === true;
}

// Usar em toda página, server action e rota do admin (o layout sozinho não protege actions).
export async function exigirAdmin() {
  const u = await usuarioAtual();
  if (!u) redirect("/login?redirect=/admin");
  if (!u.admin) notFound();
  return u;
}
