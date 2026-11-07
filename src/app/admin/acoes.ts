"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirAdmin } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { gerarPreview } from "@/lib/storage";

const anuncioSchema = z.object({
  titulo: z.string().trim().min(2).max(120),
  local: z.string().trim().min(2).max(120),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preco_base: z.coerce.number().positive().max(10000),
  fotografo: z.string().trim().max(80).optional().transform((v) => v || null)
});

export async function criarAnuncio(form: FormData) {
  await exigirAdmin();
  const dados = anuncioSchema.parse(Object.fromEntries(form));
  const { data, error } = await db.from("anuncios").insert(dados).select("id").single();
  if (error) throw error;
  redirect(`/admin/anuncios/${data.id}`);
}

export async function alternarStatus(form: FormData) {
  await exigirAdmin();
  const id = String(form.get("id"));
  const { data } = await db.from("anuncios").select("status").eq("id", id).single();
  if (data) await db.from("anuncios").update({ status: data.status === "ONLINE" ? "OFFLINE" : "ONLINE" }).eq("id", id);
  revalidatePath("/admin/anuncios");
  revalidatePath("/");
}

// Passo 1 do upload: o navegador recebe uma URL assinada e envia o original direto ao Storage
// (sem passar pelo servidor, então não esbarra no limite de corpo da Vercel/Next).
export async function urlUploadOriginal(anuncioId: string, nomeArquivo: string) {
  await exigirAdmin();
  const ext = (nomeArquivo.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z]/g, "");
  const path = `${z.string().uuid().parse(anuncioId)}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await db.storage.from("originais").createSignedUploadUrl(path);
  if (error) throw error;
  return { path, token: data.token };
}

// Passo 2: o servidor baixa o original, gera a prévia com marca d'água e registra a foto.
export async function registrarFoto(anuncioId: string, pathOriginal: string, nomeArquivo: string) {
  await exigirAdmin();
  if (!pathOriginal.startsWith(`${anuncioId}/`)) return { erro: "Caminho inválido" };

  // Código exibido ao comprador = nome do arquivo da câmera (ex.: 020A7197.JPG → 020A7197)
  const codigo = nomeArquivo.replace(/\.[^.]+$/, "").replace(/[^\w-]/g, "").slice(0, 40).toUpperCase();
  const descartar = (...paths: [string, string][]) => Promise.all(paths.map(([b, p]) => db.storage.from(b).remove([p])));

  const { data: anuncio } = await db.from("anuncios").select("preco_base").eq("id", anuncioId).single();
  if (!anuncio || !codigo) {
    await descartar(["originais", pathOriginal]);
    return { erro: "Sessão ou nome de arquivo inválido" };
  }

  const { data: blob, error: e1 } = await db.storage.from("originais").download(pathOriginal);
  if (e1) return { erro: "Original não encontrado no Storage" };

  let preview: Buffer;
  try {
    preview = await gerarPreview(Buffer.from(await blob.arrayBuffer()));
  } catch {
    await descartar(["originais", pathOriginal]);
    return { erro: "Arquivo não é uma imagem válida" };
  }

  const pathPreview = `${anuncioId}/${crypto.randomUUID()}.jpg`;
  const { error: e2 } = await db.storage.from("previews").upload(pathPreview, preview, { contentType: "image/jpeg" });
  if (e2) {
    await descartar(["originais", pathOriginal]);
    return { erro: "Falha ao salvar a prévia" };
  }

  const { error: e3 } = await db.from("fotos").insert({
    anuncio_id: anuncioId,
    codigo,
    path_preview: pathPreview,
    path_original: pathOriginal,
    preco: anuncio.preco_base
  });
  if (e3) {
    await descartar(["originais", pathOriginal], ["previews", pathPreview]);
    return { erro: e3.code === "23505" ? `Já existe uma foto ${codigo} nesta sessão` : "Falha ao registrar a foto" };
  }
  return { ok: true };
}

export async function excluirFoto(form: FormData) {
  await exigirAdmin();
  const { data: foto } = await db.from("fotos").select("anuncio_id, path_preview, path_original").eq("id", String(form.get("id"))).single();
  if (!foto) return;
  // FK com itens_venda é RESTRICT: foto já vendida não pode ser apagada (o comprador precisa baixá-la).
  const { error } = await db.from("fotos").delete().eq("id", String(form.get("id")));
  if (!error) {
    await db.storage.from("originais").remove([foto.path_original]);
    await db.storage.from("previews").remove([foto.path_preview]);
  }
  revalidatePath(`/admin/anuncios/${foto.anuncio_id}`);
}
