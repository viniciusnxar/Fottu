"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Só aceita caminhos internos, para evitar redirecionamento aberto
function destino() {
  const r = new URLSearchParams(window.location.search).get("redirect");
  return r && r.startsWith("/") && !r.startsWith("//") ? r : "/minhas-compras";
}

export default function LoginPage() {
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const { error } = await supabaseBrowser().auth.signInWithOtp({ email: email.trim().toLowerCase() });
      if (error) throw error;
      setEtapa("codigo");
    } catch (e) {
      const limite = (e as { status?: number }).status === 429;
      setErro(limite ? "Muitas tentativas. Aguarde um minuto e tente de novo." : "Não foi possível enviar o código. Confira o e-mail e tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  async function verificarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const { error } = await supabaseBrowser().auth.verifyOtp({ email: email.trim().toLowerCase(), token: codigo, type: "email" });
      if (error) throw error;
      router.push(destino());
      router.refresh();
    } catch {
      setErro("Código inválido ou expirado. Confira os dígitos ou peça um novo código.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="panel w-full max-w-sm p-8 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {etapa === "email" ? "Entrar no Fottu" : "Digite o código"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {etapa === "email"
            ? "Sem senha: enviamos um código de acesso para o seu e-mail."
            : `Enviamos um código de acesso para ${email}.`}
        </p>

        {etapa === "email" ? (
          <form onSubmit={enviarCodigo} className="mt-6 space-y-3">
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <button disabled={carregando} className="btn-primary w-full">
              {carregando ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form onSubmit={verificarCodigo} className="mt-6 space-y-3">
            <label htmlFor="codigo" className="sr-only">
              Código de acesso
            </label>
            <input
              id="codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={10}
              placeholder="000000"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              className="input tabular text-center text-2xl tracking-[0.4em]"
            />
            <button disabled={carregando || codigo.length < 6} className="btn-primary w-full">
              {carregando ? "Verificando..." : "Confirmar"}
            </button>
            <button type="button" onClick={() => setEtapa("email")} className="w-full text-sm text-muted hover:text-ink">
              Usar outro e-mail
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
