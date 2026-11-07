"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { vendaId: string; valor: string; qr: string | null; qrBase64: string | null; expiraEm: string | null };

// Mostra o QR do Pix e consulta o status a cada 5s até o pagamento ser confirmado.
export default function PixPendente({ vendaId, valor, qr, qrBase64, expiraEm }: Props) {
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch(`/api/checkout/status?vendaId=${vendaId}`, { cache: "no-store" }).catch(() => null);
      const status = res?.ok ? (await res.json()).status : null;
      if (status && status !== "PENDENTE") {
        clearInterval(t);
        router.refresh();
      }
    }, 5000);
    return () => clearInterval(t);
  }, [vendaId, router]);

  async function copiar() {
    if (!qr) return;
    await navigator.clipboard.writeText(qr);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <>
      <h2 className="font-medium text-ink">Pague com Pix</h2>
      <p className="mt-1 text-sm text-muted">Escaneie o QR Code no app do seu banco ou use o Pix copia e cola.</p>
      <div className="mt-5 rounded-xl bg-canvas p-5 ring-1 ring-line">
        {qrBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`data:image/png;base64,${qrBase64}`} alt="QR Code Pix" className="mx-auto aspect-square w-48 rounded bg-white" />
        ) : (
          <p className="py-10 text-center text-sm text-muted">QR Code indisponível. Use o copia e cola.</p>
        )}
      </div>
      <p className="tabular mt-5 text-center text-2xl font-semibold text-ink">{valor}</p>
      {qr && (
        <button onClick={copiar} className="btn-primary mt-5 w-full">
          {copiado ? "Código copiado!" : "Copiar Pix copia e cola"}
        </button>
      )}
      <p className="mt-4 text-center text-xs text-muted" aria-live="polite">
        Aguardando pagamento… a confirmação aparece aqui automaticamente.
        {expiraEm && ` Válido até ${new Date(expiraEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`}
      </p>
    </>
  );
}
