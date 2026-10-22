import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF9", // fundo da página
        surface: "#FFFFFF", // cartões, painéis
        line: "#E7E5E4", // bordas
        ink: "#18181B", // texto principal, CTA primário
        muted: "#5F5F68", // texto secundário (contraste ≥ 4.5:1 no canvas)
        accent: "#2B59F5", // seleção, links, foco
        success: "#15803D"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 1px 2px rgb(24 24 27 / 0.04), 0 4px 16px rgb(24 24 27 / 0.06)",
        lift: "0 2px 4px rgb(24 24 27 / 0.06), 0 12px 32px rgb(24 24 27 / 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
