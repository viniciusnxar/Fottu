import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "sessao_usuario";

export function gerarCodigoNumerico(tamanho = 6) {
  return Array.from({ length: tamanho }, () => Math.floor(Math.random() * 10)).join("");
}

export function criarSessao(usuarioId: string, email: string) {
  const token = jwt.sign({ usuarioId, email }, JWT_SECRET, { expiresIn: "30d" });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function lerSessao(): { usuarioId: string; email: string } | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { usuarioId: string; email: string };
  } catch {
    return null;
  }
}

export function encerrarSessao() {
  cookies().delete(COOKIE_NAME);
}
