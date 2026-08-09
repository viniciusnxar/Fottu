import Link from "next/link";

const links = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/anuncios", label: "Anúncios" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/transacoes", label: "Transações" }
];

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-sand/10 bg-ocean px-4 py-6 text-sand">
      <p className="mb-6 px-2 font-display text-sm">Admin</p>
      <nav className="space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block rounded-lg px-3 py-2 text-sm text-sand/70 transition hover:bg-sand/10 hover:text-sand"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
