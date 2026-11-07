import "server-only";
import { notFound, redirect } from "next/navigation";
import { supabaseSessao } from "@/lib/supabase";

export async function usuarioAtual() {
  const { data } = await supabaseSessao().auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email! } : null;
}

// Admins = e-mails listados em ADMIN_EMAILS (separados por vírgula).
export const ehAdmin = (email?: string | null) =>
  !!email &&
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());

// Usar em toda página, server action e rota do admin (o layout sozinho não protege actions).
export async function exigirAdmin() {
  const u = await usuarioAtual();
  if (!u) redirect("/login?redirect=/admin");
  if (!ehAdmin(u.email)) notFound();
  return u;
}
