import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "contato@seudominio.com.br";

export async function enviarCodigoLogin(email: string, codigo: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Seu código de acesso: ${codigo}`,
    html: `
      <div style="font-family: sans-serif; padding: 24px;">
        <h2>Seu código de acesso</h2>
        <p>Use o código abaixo para entrar na sua conta. Ele expira em 15 minutos.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${codigo}</p>
      </div>
    `
  });
}

export async function enviarConfirmacaoCompra(email: string, params: {
  vendaId: string;
  valorTotal: string;
  linkMinhasCompras: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Pagamento confirmado — suas fotos estão prontas",
    html: `
      <div style="font-family: sans-serif; padding: 24px;">
        <h2>Compra confirmada</h2>
        <p>Pedido #${params.vendaId} — R$ ${params.valorTotal}</p>
        <p>Suas fotos em alta resolução já estão disponíveis para download.</p>
        <a href="${params.linkMinhasCompras}">Acessar minhas compras</a>
      </div>
    `
  });
}
