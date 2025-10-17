import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PROXY_TARGET = process.env.VITE_PROXY_TARGET || "http://10.4.55.81:3001";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@services": path.resolve(__dirname, "src/services"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: true,
    strictPort: true,
    proxy: {
      "/api": { target: PROXY_TARGET, changeOrigin: true, secure: false },
    },
  },
});
