"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PagarButton({ vendaId }: { vendaId: string }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function pagar() {
    setCarregando(true);
    setErro(null);
    const res = await fetch("/api/checkout/pagar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendaId })
    });
    setCarregando(false);
    if (!res.ok) return setErro("Não foi possível confirmar o pagamento. Tente de novo.");
    router.refresh();
  }

  return (
    <>
      <button onClick={pagar} disabled={carregando} className="btn-primary mt-5 w-full">
        {carregando ? "Confirmando..." : "Simular pagamento Pix"}
      </button>
      {erro && (
        <p role="alert" className="mt-3 text-center text-sm text-red-700">
          {erro}
        </p>
      )}
    </>
  );
}
