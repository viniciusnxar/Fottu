"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { brl } from "@/lib/format";

type FotoResumo = {
  id: string;
  codigo: string;
  urlPreview: string;
  preco: number;
};

export default function PhotoGrid({ fotos }: { fotos: FotoResumo[] }) {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const visiveis = fotos.filter((f) => f.codigo.toLowerCase().includes(filtro.trim().toLowerCase()));
  const total = useMemo(
    () => fotos.filter((f) => selecionadas.has(f.id)).reduce((s, f) => s + f.preco, 0),
    [fotos, selecionadas]
  );

  function alternar(id: string) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });
  }

  async function irParaCheckout() {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoIds: Array.from(selecionadas) })
      });

      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) throw new Error();

      const data = await res.json();
      router.push(`/checkout/${data.vendaId}`);
    } catch {
      setErro("Não foi possível criar o pedido. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <label className="relative w-full max-w-xs">
          <span className="sr-only">Filtrar pelo código da foto</span>
          <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" strokeLinecap="round" />
          </svg>
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar pelo código"
            className="input rounded-full pl-10"
          />
        </label>
        <p className="text-sm text-muted">Toque nas fotos para selecionar.</p>
      </div>

      {visiveis.length === 0 ? (
        <p className="panel px-6 py-12 text-center text-sm text-muted">Nenhuma foto com o código “{filtro}”.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {visiveis.map((foto) => {
            const ativa = selecionadas.has(foto.id);
            return (
              <button
                key={foto.id}
                onClick={() => alternar(foto.id)}
                className={`group relative aspect-[4/3] overflow-hidden rounded-xl bg-line transition duration-200 ease-out ${
                  ativa ? "ring-[3px] ring-accent ring-offset-2 ring-offset-canvas" : "hover:shadow-lift"
                }`}
                aria-pressed={ativa}
                aria-label={`Selecionar foto ${foto.codigo}, ${brl(foto.preco)}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.urlPreview}
                  alt=""
                  loading="lazy"
                  className={`h-full w-full object-cover transition duration-300 ease-out ${ativa ? "scale-[0.97] rounded-lg" : ""}`}
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-8 text-xs text-white">
                  <span className="tabular font-medium">{foto.codigo}</span>
                  <span className="tabular">{brl(foto.preco)}</span>
                </span>
                <span
                  className={`absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full transition ${
                    ativa ? "bg-accent text-white" : "bg-white/85 text-transparent ring-1 ring-black/10 group-hover:text-ink/40"
                  }`}
                >
                  <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Barra fixa de resumo — some se nada selecionado */}
      {selecionadas.size > 0 && (
        <div className="sticky bottom-4 z-20 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink px-5 py-4 text-white shadow-lift">
          <div>
            <p className="text-sm text-white/70">
              {selecionadas.size} {selecionadas.size === 1 ? "foto selecionada" : "fotos selecionadas"}
            </p>
            <p className="tabular text-xl font-semibold">{brl(total)}</p>
            {erro && <p className="mt-1 text-sm text-red-300">{erro}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelecionadas(new Set())} className="btn bg-white/10 text-white hover:bg-white/20">
              Limpar
            </button>
            <button onClick={irParaCheckout} disabled={carregando} className="btn bg-white text-ink hover:bg-white/90">
              {carregando ? "Criando pedido..." : "Comprar via Pix"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
