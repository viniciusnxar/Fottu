"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrar, entrar, esqueciSenha } from "./acoes";

type Modo = "entrar" | "cadastrar" | "esqueci";

const titulos: Record<Modo, [string, string]> = {
  entrar: ["Entrar no Fottu", "Use seu e-mail e senha."],
  cadastrar: ["Criar conta", "Depois do cadastro, sua conta passa por aprovação."],
  esqueci: ["Esqueci minha senha", "Enviamos um link para você criar uma nova senha."]
};

// Só aceita caminhos internos, para evitar redirecionamento aberto
function destino() {
  const r = new URLSearchParams(window.location.search).get("redirect");
  return r && r.startsWith("/") && !r.startsWith("//") ? r : "/minhas-compras";
}

export default function LoginPage() {
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("erro") === "link")
      setErro("Este link expirou ou já foi usado. Peça um novo.");
  }, []);

  function trocar(m: Modo) {
    setModo(m);
    setErro(null);
    setAviso(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      const r =
        modo === "entrar" ? await entrar({ email, senha }) : modo === "cadastrar" ? await cadastrar({ email, senha }) : await esqueciSenha({ email });
      if ("erro" in r && r.erro) return setErro(r.erro);
      if (modo === "entrar") {
        router.push(destino());
        router.refresh();
        return;
      }
      setAviso("msg" in r && typeof r.msg === "string" ? r.msg : null);
      setSenha("");
      if (modo === "cadastrar") setModo("entrar");
    } catch {
      setErro("Algo deu errado. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  const [titulo, subtitulo] = titulos[modo];

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="panel w-full max-w-sm p-8 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{titulo}</h1>
        <p className="mt-2 text-sm text-muted">{subtitulo}</p>

        {aviso && (
          <p role="status" className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900 ring-1 ring-green-200">
            {aviso}
          </p>
        )}

        <form onSubmit={enviar} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
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
          </div>

          {modo !== "esqueci" && (
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="senha" className="block text-sm font-medium text-ink">
                  Senha
                </label>
                {modo === "entrar" && (
                  <button type="button" onClick={() => trocar("esqueci")} className="text-xs text-muted hover:text-ink">
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <input
                id="senha"
                type="password"
                required
                minLength={modo === "cadastrar" ? 8 : undefined}
                autoComplete={modo === "cadastrar" ? "new-password" : "current-password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input"
              />
              {modo === "cadastrar" && <p className="mt-1.5 text-xs text-muted">Mínimo de 8 caracteres.</p>}
            </div>
          )}

          <button disabled={carregando} className="btn-primary w-full">
            {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar" : modo === "cadastrar" ? "Criar conta" : "Enviar link"}
          </button>
        </form>

        {erro && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {erro}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          {modo === "entrar" ? (
            <>
              Não tem conta?{" "}
              <button onClick={() => trocar("cadastrar")} className="font-medium text-ink underline underline-offset-4">
                Criar conta
              </button>
            </>
          ) : (
            <button onClick={() => trocar("entrar")} className="font-medium text-ink underline underline-offset-4">
              Voltar para o login
            </button>
          )}
        </p>
      </div>
    </main>
  );
}
