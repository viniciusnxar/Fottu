import Link from "next/link";
import { lerSessao } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default function SiteHeader() {
  const sessao = lerSessao();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          fottu
        </Link>
        <nav className="flex items-center gap-1 text-sm text-muted">
          <Link href="/" className="hidden rounded-full px-3 py-1.5 sm:block transition hover:bg-ink/5 hover:text-ink">
            Sessões
          </Link>
          <Link href="/minhas-compras" className="rounded-full px-3 py-1.5 transition hover:bg-ink/5 hover:text-ink">
            Minhas compras
          </Link>
          <Link href="/admin" className="hidden rounded-full px-3 py-1.5 transition hover:bg-ink/5 hover:text-ink sm:block">
            Admin
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 md:inline">
            Modo offline · dados de demonstração
          </span>
          {sessao ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-muted sm:inline">{sessao.email}</span>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="btn-primary px-4 py-2">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
