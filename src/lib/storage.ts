import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

// Cliente compatível com Cloudflare R2 e AWS S3 (mesma API)
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!
  }
});

const BUCKET = process.env.STORAGE_BUCKET!;

/**
 * Recebe o arquivo original (alta resolução) e:
 * 1. Salva o original em uma pasta privada do bucket (nunca servida publicamente)
 * 2. Gera uma versão de preview: resolução reduzida + marca d'água diagonal
 *    e salva em pasta pública
 * Retorna as chaves (keys) de ambos os arquivos no bucket.
 */
export async function processarUploadFoto(params: {
  buffer: Buffer;
  anuncioId: string;
  codigo: string;
}) {
  const { buffer, anuncioId, codigo } = params;

  const keyOriginal = `originais/${anuncioId}/${codigo}.jpg`;
  const keyPreview = `previews/${anuncioId}/${codigo}.jpg`;

  // 1. Original — qualidade máxima, acesso restrito (sem ACL pública)
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: keyOriginal,
      Body: buffer,
      ContentType: "image/jpeg"
    })
  );

  // 2. Preview — reduz resolução e aplica marca d'água repetida (mesmo padrão
  //    diagonal usado no exemplo do produto) para dificultar reuso/upscale
  const marcaDagua = await gerarSvgMarcaDagua();
  const previewBuffer = await sharp(buffer)
    .resize({ width: 900, withoutEnlargement: true }) // baixa resolução
    .composite([{ input: marcaDagua, tile: true, blend: "over" }])
    .jpeg({ quality: 72 })
    .toBuffer();

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: keyPreview,
      Body: previewBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read"
    })
  );

  return {
    keyOriginal,
    keyPreview,
    urlPreview: `${process.env.STORAGE_PUBLIC_URL}/${keyPreview}`
  };
}

// Gera um bloco SVG com o padrão diagonal + ícone, repetido via `tile: true`
async function gerarSvgMarcaDagua(): Promise<Buffer> {
  const svg = `
    <svg width="220" height="220" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#F3E9D6" stroke-opacity="0.35" stroke-width="2">
        <line x1="0" y1="220" x2="220" y2="0" />
      </g>
      <text x="20" y="120" fill="#F3E9D6" fill-opacity="0.45"
        font-family="sans-serif" font-size="14" transform="rotate(-35 20 120)">
        PREVIEW
      </text>
    </svg>`;
  return Buffer.from(svg);
}

/**
 * Gera uma URL assinada e temporária (expira em X segundos) para o comprador
 * baixar o arquivo ORIGINAL. Só deve ser chamada depois de confirmar que
 * a Venda está com status PAGO e pertence ao usuário logado.
 */
export async function gerarUrlDownload(keyOriginal: string, expiraEmSegundos = 300) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: keyOriginal });
  return getSignedUrl(s3, command, { expiresIn: expiraEmSegundos });
}
