// Banco em memória para rodar offline, sem PostgreSQL nem .env.
// shortcut: dados somem ao reiniciar o servidor; troque por Prisma (prisma/schema.prisma) para produção.

export type StatusAnuncio = "ONLINE" | "OFFLINE";
export type StatusVenda = "PENDENTE" | "PAGO" | "CANCELADO" | "EXPIRADO";

export type Anuncio = {
  id: string;
  titulo: string;
  local: string;
  data: Date;
  precoBase: number;
  status: StatusAnuncio;
  fotografo: string | null;
  criadoEm: Date;
};

export type Foto = {
  id: string;
  anuncioId: string;
  codigo: string;
  preco: number;
  ordem: number;
  matiz: number; // cor da imagem de demonstração gerada
  arquivo?: Buffer; // original enviado pelo upload (fotos reais)
  preview?: Buffer; // preview com marca d'água gerado no upload
};

export type Usuario = { id: string; email: string; criadoEm: Date };
export type CodigoLogin = { id: string; usuarioId: string; codigo: string; expiraEm: Date; usadoEm: Date | null; criadoEm: Date };
export type ItemVenda = { fotoId: string; preco: number };
export type Venda = {
  id: string;
  usuarioId: string;
  valorTotal: number;
  status: StatusVenda;
  itens: ItemVenda[];
  criadoEm: Date;
  pagoEm: Date | null;
};
export type Transacao = { id: string; vendaId: string; metodo: string; valor: number; criadoEm: Date };

type Store = {
  anuncios: Anuncio[];
  fotos: Foto[];
  usuarios: Usuario[];
  codigos: CodigoLogin[];
  vendas: Venda[];
  transacoes: Transacao[];
};

export function novoId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

function semear(): Store {
  const sessoes: [string, string, number, number, number][] = [
    // titulo, local, dias atrás, preço, matiz
    ["Futevôlei de domingo", "Ipanema, Rio de Janeiro", 2, 12.9, 200],
    ["Corrida 10K do Aterro", "Aterro do Flamengo, Rio de Janeiro", 6, 9.9, 28],
    ["Treino de surf ao amanhecer", "Arpoador, Rio de Janeiro", 9, 14.9, 340],
    ["Pedal na orla", "Copacabana, Rio de Janeiro", 15, 8.9, 160],
    ["Vôlei de praia — final do torneio", "Barra da Tijuca, Rio de Janeiro", 21, 12.9, 45],
    ["Ensaio no parque", "Parque Lage, Rio de Janeiro", 30, 19.9, 120]
  ];

  const store: Store = { anuncios: [], fotos: [], usuarios: [], codigos: [], vendas: [], transacoes: [] };
  let seq = 7190;

  sessoes.forEach(([titulo, local, diasAtras, preco, matiz], i) => {
    const id = `demo${i + 1}`;
    store.anuncios.push({
      id,
      titulo,
      local,
      data: new Date(Date.now() - diasAtras * 864e5),
      precoBase: preco,
      status: i === 5 ? "OFFLINE" : "ONLINE",
      fotografo: null,
      criadoEm: new Date(Date.now() - diasAtras * 864e5)
    });
    for (let n = 0; n < 12; n++) {
      store.fotos.push({
        id: `${id}f${n + 1}`,
        anuncioId: id,
        codigo: `0${20 + i}A${seq++}`,
        preco,
        ordem: n,
        matiz: (matiz + n * 9) % 360
      });
    }
  });

  return store;
}

// globalThis mantém um único store entre rotas e hot reload do Next
const g = globalThis as unknown as { fottuStore?: Store };
export const db = (g.fottuStore ??= semear());

export const fotoUrl = (id: string, tipo: "preview" | "original") => `/api/foto/${id}/${tipo}`;
export const fotosDo = (anuncioId: string) =>
  db.fotos.filter((f) => f.anuncioId === anuncioId).sort((a, b) => a.ordem - b.ordem);
export const capaDe = (anuncioId: string) => fotosDo(anuncioId)[0];
