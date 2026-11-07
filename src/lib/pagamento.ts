import "server-only";
import { db } from "@/lib/supabase";

const MP = "https://api.mercadopago.com/v1/payments";
const PIX_MINUTOS = 30;

function headers(extra: Record<string, string> = {}) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...extra };
}

type PagamentoMP = {
  id: number;
  status: string; // pending | approved | rejected | cancelled | refunded | ...
  external_reference: string | null;
  transaction_amount: number;
  point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } };
};

// Cria a cobrança Pix no Mercado Pago e grava o QR no pedido.
export async function criarPix(venda: { id: string; email: string; valor_total: number }) {
  const expira = new Date(Date.now() + PIX_MINUTOS * 60_000);
  const site = (process.env.SITE_URL ?? "").replace(/\/+$/, "");
  const res = await fetch(MP, {
    method: "POST",
    headers: headers({ "X-Idempotency-Key": venda.id }),
    body: JSON.stringify({
      transaction_amount: Number(venda.valor_total),
      description: `Fottu — pedido ${venda.id.slice(-8)}`,
      payment_method_id: "pix",
      payer: { email: venda.email },
      external_reference: venda.id,
      // MP exige o fuso explícito; -03:00 = horário de Brasília
      date_of_expiration: new Date(expira.getTime() - 3 * 3600_000).toISOString().replace("Z", "-03:00"),
      // MP recusa URL não-https (ex.: localhost); sem ela, o polling do checkout confirma o pagamento.
      ...(site.startsWith("https://") && { notification_url: `${site}/api/webhooks/mercadopago` })
    })
  });
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${await res.text()}`);
  const p = (await res.json()) as PagamentoMP;

  const { error } = await db
    .from("vendas")
    .update({
      mp_payment_id: String(p.id),
      pix_qr: p.point_of_interaction?.transaction_data?.qr_code,
      pix_qr_base64: p.point_of_interaction?.transaction_data?.qr_code_base64,
      expira_em: expira.toISOString()
    })
    .eq("id", venda.id);
  if (error) throw error;
}

/**
 * Consulta o pagamento direto no Mercado Pago (fonte da verdade) e atualiza o pedido.
 * Usado pelo webhook e pelo polling do checkout. Idempotente: só muda pedidos PENDENTES.
 */
export async function sincronizarPagamento(paymentId: string) {
  const res = await fetch(`${MP}/${encodeURIComponent(paymentId)}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) return null;
  const p = (await res.json()) as PagamentoMP;
  if (!p.external_reference) return null;

  const { data: venda } = await db
    .from("vendas")
    .select("id, status, valor_total")
    .eq("id", p.external_reference)
    .eq("mp_payment_id", String(p.id))
    .maybeSingle();
  if (!venda || venda.status !== "PENDENTE") return venda?.status ?? null;

  if (p.status === "approved" && Number(p.transaction_amount) >= Number(venda.valor_total)) {
    const { data: atualizada } = await db
      .from("vendas")
      .update({ status: "PAGO", pago_em: new Date().toISOString() })
      .eq("id", venda.id)
      .eq("status", "PENDENTE")
      .select("id")
      .maybeSingle();
    // Só quem efetivamente virou o status grava a transação (webhook e polling podem concorrer).
    if (atualizada) {
      await db.from("transacoes").insert({ venda_id: venda.id, metodo: "pix", valor: p.transaction_amount, id_externo_gateway: String(p.id) });
    }
    return "PAGO";
  }

  if (["cancelled", "rejected", "expired"].includes(p.status)) {
    const status = p.status === "rejected" ? "CANCELADO" : "EXPIRADO";
    await db.from("vendas").update({ status }).eq("id", venda.id).eq("status", "PENDENTE");
    return status;
  }
  return "PENDENTE";
}
