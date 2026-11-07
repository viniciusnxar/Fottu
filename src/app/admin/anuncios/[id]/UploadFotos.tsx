"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { registrarFoto, urlUploadOriginal } from "../../acoes";

type Linha = { nome: string; estado: "fila" | "enviando" | "ok" | "erro"; msg?: string };
const PARALELO = 3;

export default function UploadFotos({ anuncioId }: { anuncioId: string }) {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const router = useRouter();

  async function enviar(arquivos: File[]) {
    if (!arquivos.length) return;
    setOcupado(true);
    setLinhas(arquivos.map((a) => ({ nome: a.name, estado: "fila" })));
    const marcar = (i: number, l: Partial<Linha>) => setLinhas((at) => at.map((x, j) => (j === i ? { ...x, ...l } : x)));
    const storage = supabaseBrowser().storage.from("originais");

    let proximo = 0;
    const trabalhador = async () => {
      while (proximo < arquivos.length) {
        const i = proximo++;
        const arq = arquivos[i];
        marcar(i, { estado: "enviando" });
        try {
          const { path, token } = await urlUploadOriginal(anuncioId, arq.name);
          const { error } = await storage.uploadToSignedUrl(path, token, arq, { contentType: arq.type });
          if (error) throw new Error(error.message);
          const r = await registrarFoto(anuncioId, path, arq.name);
          marcar(i, r.erro ? { estado: "erro", msg: r.erro } : { estado: "ok" });
        } catch (e) {
          marcar(i, { estado: "erro", msg: e instanceof Error ? e.message : "Falha no envio" });
        }
      }
    };
    await Promise.all(Array.from({ length: PARALELO }, trabalhador));
    setOcupado(false);
    router.refresh();
  }

  const feitos = linhas.filter((l) => l.estado === "ok").length;
  const erros = linhas.filter((l) => l.estado === "erro");

  return (
    <div className="panel mt-8 p-6">
      <label className="block">
        <span className="text-sm font-medium text-ink">Enviar fotos</span>
        <span className="mt-1 block text-sm text-muted">
          JPG, PNG ou WebP até 50 MB. O nome do arquivo vira o código da foto (ex.: 020A7197.JPG). A prévia com marca d&apos;água é gerada
          automaticamente.
        </span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={ocupado}
          onChange={(e) => {
            enviar(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
          className="mt-4 block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-ink/85 disabled:opacity-50"
        />
      </label>

      {linhas.length > 0 && (
        <div className="mt-4" aria-live="polite">
          <p className="tabular text-sm text-ink">
            {ocupado ? "Enviando" : "Concluído"}: {feitos} de {linhas.length}
            {erros.length > 0 && <span className="text-red-700"> · {erros.length} com erro</span>}
          </p>
          {erros.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-red-700">
              {erros.map((l) => (
                <li key={l.nome}>
                  {l.nome}: {l.msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
