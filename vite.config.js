import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Live perfume photos come from Open Beauty Facts (free, no key).
      // The proxy avoids browser CORS problems while developing.
      "/obf": {
        target: "https://world.openbeautyfacts.org",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/obf/, ""),
      },
    },
  },
});