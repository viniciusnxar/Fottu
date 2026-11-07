import "server-only";
import sharp from "sharp";

/**
 * Prévia em baixa resolução com marca d'água repetida, para dificultar reuso/upscale.
 * O original fica intocado no bucket privado.
 */
export async function gerarPreview(original: Buffer) {
  return sharp(original)
    .rotate() // respeita a orientação EXIF da câmera
    .resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true })
    .composite([{ input: Buffer.from(blocoMarcaDagua()), tile: true, blend: "over" }])
    .jpeg({ quality: 72 })
    .toBuffer();
}

function blocoMarcaDagua() {
  return `<svg width="220" height="220" xmlns="http://www.w3.org/2000/svg">
    <text x="20" y="130" fill="#fff" fill-opacity="0.45" font-family="sans-serif" font-size="15"
      font-weight="700" letter-spacing="3" transform="rotate(-30 20 130)">FOTTU · PRÉVIA</text>
  </svg>`;
}
