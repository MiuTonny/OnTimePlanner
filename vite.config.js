import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5555",
        changeOrigin: true,
      },
      "/nominatim": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        headers: {
          "Accept-Language": "en",
        },
        rewrite: (path) => path.replace(/^\/nominatim/, ""),
      },
    },
  },
});
