// Datas puras ("2026-11-07") viram meio-dia UTC para não "voltar um dia" no fuso do Brasil.
const paraData = (d: string | Date) => (typeof d === "string" && d.length === 10 ? new Date(`${d}T12:00:00Z`) : new Date(d));
const fuso = { timeZone: "America/Sao_Paulo" } as const;

export const brl = (valor: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor));

export const dataCurta = (d: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", { ...fuso, day: "2-digit", month: "short", year: "numeric" }).format(paraData(d));

export const dataLonga = (d: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", { ...fuso, day: "2-digit", month: "long", year: "numeric" }).format(paraData(d));

export const dataHora = (d: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", { ...fuso, dateStyle: "short", timeStyle: "short" }).format(paraData(d));
