"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { estaAprovado } from "@/lib/auth";
import { supabaseSessao } from "@/lib/supabase";

const email = z.string().trim().toLowerCase().email();
const senha = z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(72);
const PENDENTE = "Sua conta ainda não foi aprovada. Você poderá entrar assim que ela for liberada.";

// Origem do request atual: funciona igual em localhost e na Vercel.
const origem = () => headers().get("origin") ?? process.env.SITE_URL?.replace(/\/+$/, "") ?? "";

export async function entrar(dados: { email: string; senha: string }) {
  const e = email.safeParse(dados.email);
  if (!e.success || !dados.senha) return { erro: "Informe e-mail e senha." };

  const supabase = supabaseSessao();
  const { data, error } = await supabase.auth.signInWithPassword({ email: e.data, password: dados.senha });
  if (error) {
    if (error.code === "email_not_confirmed") return { erro: "Confirme seu e-mail pelo link que enviamos antes de entrar." };
    return { erro: "E-mail ou senha incorretos." };
  }
  if (!(await estaAprovado(data.user.id))) {
    await supabase.auth.signOut();
    return { erro: PENDENTE };
  }
  return { ok: true };
}

export async function cadastrar(dados: { email: string; senha: string }) {
  const e = email.safeParse(dados.email);
  if (!e.success) return { erro: "E-mail inválido." };
  const s = senha.safeParse(dados.senha);
  if (!s.success) return { erro: s.error.issues[0].message };

  const supabase = supabaseSessao();
  const { data, error } = await supabase.auth.signUp({
    email: e.data,
    password: s.data,
    options: { emailRedirectTo: `${origem()}/auth/callback?next=/login` }
  });
  if (error) {
    if (error.code === "user_already_exists") return { erro: "Já existe uma conta com este e-mail. Entre ou redefina a senha." };
    if (error.code === "weak_password") return { erro: "Senha fraca. Use letras e números, com pelo menos 8 caracteres." };
    return { erro: "Não foi possível criar a conta. Tente de novo." };
  }
  // Conta nasce não aprovada: não deixa sessão aberta.
  if (data.session) await supabase.auth.signOut();
  return {
    ok: true,
    msg: data.session
      ? "Conta criada! Ela será liberada após aprovação."
      : "Conta criada! Confirme seu e-mail pelo link que enviamos. O acesso é liberado após aprovação."
  };
}

export async function esqueciSenha(dados: { email: string }) {
  const e = email.safeParse(dados.email);
  if (!e.success) return { erro: "E-mail inválido." };
  const { error } = await supabaseSessao().auth.resetPasswordForEmail(e.data, {
    redirectTo: `${origem()}/auth/callback?next=/redefinir-senha`
  });
  if (error?.status === 429) return { erro: "Muitas tentativas. Aguarde alguns minutos." };
  // Mesma resposta exista ou não a conta, para não revelar quais e-mails estão cadastrados.
  return { ok: true, msg: "Se houver uma conta com este e-mail, você vai receber um link para criar uma nova senha." };
}

export async function redefinirSenha(dados: { senha: string }) {
  const s = senha.safeParse(dados.senha);
  if (!s.success) return { erro: s.error.issues[0].message };
  const supabase = supabaseSessao();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { erro: "Link expirado. Peça um novo e-mail de redefinição." };

  const { error } = await supabase.auth.updateUser({ password: s.data });
  if (error) return { erro: error.code === "same_password" ? "Use uma senha diferente da anterior." : "Não foi possível salvar a senha." };
  if (!(await estaAprovado(data.user.id))) {
    await supabase.auth.signOut();
    return { ok: true, msg: `Senha alterada. ${PENDENTE}` };
  }
  return { ok: true };
}
