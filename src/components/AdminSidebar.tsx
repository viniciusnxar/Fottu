"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/anuncios", label: "Anúncios" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/transacoes", label: "Transações" }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="shrink-0 border-b border-line md:w-56 md:border-b-0 md:border-r">
      <nav className="flex gap-1 overflow-x-auto px-4 py-3 md:flex-col md:px-3 md:py-8">
        <p className="hidden px-3 pb-3 text-xs font-medium uppercase tracking-wide text-muted md:block">Painel</p>
        {links.map((l) => {
          const ativo = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={ativo ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                ativo ? "bg-ink text-white" : "text-muted hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
