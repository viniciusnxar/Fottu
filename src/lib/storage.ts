import sharp from "sharp";
import type { Foto } from "@/lib/db";

/**
 * Upload offline: guarda o original em memória e gera um preview em baixa
 * resolução com marca d'água repetida, para dificultar reuso/upscale.
 */
export async function processarUploadFoto(buffer: Buffer) {
  const preview = await sharp(buffer)
    .resize({ width: 900, withoutEnlargement: true })
    .composite([{ input: Buffer.from(blocoMarcaDagua()), tile: true, blend: "over" }])
    .jpeg({ quality: 72 })
    .toBuffer();
  return { arquivo: buffer, preview };
}

function blocoMarcaDagua() {
  return `<svg width="220" height="220" xmlns="http://www.w3.org/2000/svg">
    <text x="20" y="130" fill="#fff" fill-opacity="0.45" font-family="sans-serif" font-size="15"
      font-weight="700" letter-spacing="3" transform="rotate(-30 20 130)">FOTTU · PRÉVIA</text>
  </svg>`;
}

/**
 * Imagem de demonstração (fotos sintéticas do modo offline): uma cena ao ar
 * livre gerada em SVG a partir da matiz da foto. O preview leva marca d'água.
 */
export function svgDemo(foto: Foto, comMarca: boolean) {
  const h = foto.matiz;
  const n = Number(foto.codigo.replace(/\D/g, "")) || 0;
  const sol = 180 + (n * 97) % 840;
  const pessoa = 140 + (n * 53) % 920;
  const marca = comMarca
    ? `<defs><pattern id="m" width="300" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
         <text x="10" y="110" fill="#fff" fill-opacity="0.5" font-family="sans-serif" font-size="22" font-weight="700" letter-spacing="4">FOTTU · PRÉVIA</text>
       </pattern></defs><rect width="1200" height="900" fill="url(#m)"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
    <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${h} 60% 72%)"/><stop offset="1" stop-color="hsl(${(h + 30) % 360} 70% 88%)"/>
    </linearGradient>
    <rect width="1200" height="900" fill="url(#c)"/>
    <circle cx="${sol}" cy="230" r="90" fill="hsl(${(h + 40) % 360} 90% 92%)"/>
    <path d="M0 520 Q300 460 600 510 T1200 490 V900 H0Z" fill="hsl(${h} 45% 45%)"/>
    <path d="M0 640 Q400 600 800 650 T1200 630 V900 H0Z" fill="hsl(${(h + 20) % 360} 35% 62%)"/>
    <g fill="hsl(${h} 40% 16%)">
      <circle cx="${pessoa}" cy="520" r="34"/>
      <path d="M${pessoa - 50} 760 Q${pessoa} 540 ${pessoa + 50} 760Z"/>
    </g>
    <text x="40" y="70" fill="#fff" fill-opacity="0.85" font-family="sans-serif" font-size="26" font-weight="600">${foto.codigo} · foto de demonstração</text>
    ${marca}
  </svg>`;
}
