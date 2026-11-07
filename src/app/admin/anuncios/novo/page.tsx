import Link from "next/link";
import { criarAnuncio } from "../../acoes";

export default function NovoAnuncioPage() {
  return (
    <div className="max-w-lg">
      <Link href="/admin/anuncios" className="text-sm text-muted transition hover:text-ink">
        ← Anúncios
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Nova sessão</h1>
      <p className="mt-1 text-sm text-muted">A sessão começa offline. Envie as fotos e depois coloque online.</p>

      <form action={criarAnuncio} className="panel mt-6 space-y-4 p-6">
        <Campo id="titulo" rotulo="Título" placeholder="Futevôlei de domingo" required />
        <Campo id="local" rotulo="Local" placeholder="Ipanema, Rio de Janeiro" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="data" rotulo="Data" type="date" required />
          <Campo id="preco_base" rotulo="Preço por foto (R$)" type="number" step="0.01" min="0.01" placeholder="12.90" required />
        </div>
        <Campo id="fotografo" rotulo="Fotógrafo (opcional)" />
        <button className="btn-primary w-full">Criar e enviar fotos</button>
      </form>
    </div>
  );
}

function Campo({ id, rotulo, ...props }: { id: string; rotulo: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {rotulo}
      </label>
      <input id={id} name={id} className="input" {...props} />
    </div>
  );
}
