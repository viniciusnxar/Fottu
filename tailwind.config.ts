import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ocean: "#0E2A3D",   // fundo escuro, hero, admin
        sand: "#F3E9D6",    // fundo claro do marketplace
        coral: "#FF6B4A",   // preço, CTA
        aqua: "#2FB6A6",    // status online, links
        ink: "#16221F"      // texto principal
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"]
      },
      backgroundImage: {
        perforation:
          "radial-gradient(circle, transparent 4px, #F3E9D6 4.5px)"
      }
    }
  },
  plugins: []
};

export default config;
