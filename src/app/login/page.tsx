"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error();
      setEtapa("codigo");
    } catch {
      setErro("Não foi possível enviar o código. Confira o e-mail e tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  async function verificarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo })
      });
      if (!res.ok) throw new Error();
      router.push("/minhas-compras");
    } catch {
      setErro("Código inválido ou expirado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="font-display text-xl text-ink">Entrar</h1>
        <p className="mt-1 text-sm text-ink/60">
          {etapa === "email"
            ? "Digite seu e-mail para receber um código de acesso."
            : `Enviamos um código para ${email}.`}
        </p>

        {etapa === "email" ? (
          <form onSubmit={enviarCodigo} className="mt-5 space-y-3">
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-coral"
            />
            <button
              disabled={carregando}
              className="w-full rounded-lg bg-ocean py-2.5 text-sm font-medium text-sand transition hover:bg-ocean/90 disabled:opacity-50"
            >
              {carregando ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form onSubmit={verificarCodigo} className="mt-5 space-y-3">
            <input
              inputMode="numeric"
              required
              maxLength={6}
              placeholder="000000"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-center font-mono text-lg tracking-[0.3em] outline-none focus:border-coral"
            />
            <button
              disabled={carregando}
              className="w-full rounded-lg bg-coral py-2.5 text-sm font-medium text-white transition hover:bg-coral/90 disabled:opacity-50"
            >
              {carregando ? "Verificando..." : "Confirmar"}
            </button>
          </form>
        )}

        {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
      </div>
    </main>
  );
}
