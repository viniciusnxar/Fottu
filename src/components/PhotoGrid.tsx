"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FotoResumo = {
  id: string;
  codigo: string;
  urlPreview: string;
  preco: number;
};

export default function PhotoGrid({ fotos }: { fotos: FotoResumo[] }) {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

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
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoIds: Array.from(selecionadas) })
      });

      if (res.status === 401) {
        router.push(`/login?redirect=/produto`);
        return;
      }

      const data = await res.json();
      router.push(`/checkout/${data.vendaId}`);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fotos.map((foto) => {
          const ativa = selecionadas.has(foto.id);
          return (
            <button
              key={foto.id}
              onClick={() => alternar(foto.id)}
              className={`group relative aspect-square overflow-hidden rounded-lg ring-2 transition ${
                ativa ? "ring-coral" : "ring-transparent hover:ring-ocean/20"
              }`}
              aria-pressed={ativa}
              aria-label={`Selecionar foto ${foto.codigo}`}
            >
              <Image src={foto.urlPreview} alt={`Foto ${foto.codigo}`} fill className="object-cover" />
              <span className="absolute bottom-1 left-1 rounded bg-ocean/80 px-1.5 py-0.5 font-mono text-[10px] text-sand">
                {foto.codigo}
              </span>
              {ativa && (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-xs text-white">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Barra fixa de resumo — some se nada selecionado */}
      {selecionadas.size > 0 && (
        <div className="sticky bottom-4 mt-6 flex items-center justify-between rounded-xl bg-ocean px-5 py-4 text-sand shadow-lg">
          <div>
            <p className="font-mono text-xs text-sand/60">{selecionadas.size} foto(s) selecionada(s)</p>
            <p className="font-display text-lg">R$ {total.toFixed(2).replace(".", ",")}</p>
          </div>
          <button
            onClick={irParaCheckout}
            disabled={carregando}
            className="rounded-lg bg-coral px-5 py-2.5 font-medium text-white transition hover:bg-coral/90 disabled:opacity-50"
          >
            {carregando ? "Aguarde..." : "Comprar via Pix"}
          </button>
        </div>
      )}
    </div>
  );
}
