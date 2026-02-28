import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Tauri expects the dev server on a fixed port
  server: { port: 1422, strictPort: true },
  // Prevent Vite from obscuring Rust errors
  clearScreen: false,
  // Tauri uses env vars to distinguish dev from production
  envPrefix: ["VITE_", "TAURI_"],
});
