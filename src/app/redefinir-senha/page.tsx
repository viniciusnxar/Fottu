"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { redefinirSenha } from "../login/acoes";

// Aberta pelo link do e-mail de redefinição (via /auth/callback, que já abriu a sessão).
export default function RedefinirSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha !== confirmacao) return setErro("As senhas não são iguais.");
    setCarregando(true);
    try {
      const r = await redefinirSenha({ senha });
      if ("erro" in r && r.erro) return setErro(r.erro);
      if ("msg" in r && r.msg) return setAviso(r.msg);
      router.push("/minhas-compras");
      router.refresh();
    } catch {
      setErro("Algo deu errado. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="panel w-full max-w-sm p-8 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Nova senha</h1>
        {aviso ? (
          <>
            <p role="status" className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900 ring-1 ring-green-200">
              {aviso}
            </p>
            <Link href="/login" className="btn-primary mt-6 w-full">
              Ir para o login
            </Link>
          </>
        ) : (
          <form onSubmit={salvar} className="mt-6 space-y-4">
            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-ink">
                Nova senha
              </label>
              <input id="senha" type="password" required minLength={8} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="confirmacao" className="mb-1.5 block text-sm font-medium text-ink">
                Repita a senha
              </label>
              <input id="confirmacao" type="password" required minLength={8} autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className="input" />
            </div>
            <button disabled={carregando} className="btn-primary w-full">
              {carregando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
        {erro && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {erro}
          </p>
        )}
      </div>
    </main>
  );
}
