import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/nominatim": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        // optional but helps some providers:
        headers: {
          // Can't truly set browser User-Agent, but proxy can send headers
          "Accept-Language": "en",
        },
        rewrite: (path) => path.replace(/^\/nominatim/, ""),
      },
    },
  },
});
