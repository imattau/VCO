import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      // @vco/vco-sync and @vco/vco-transport use Node.js-only APIs (node:crypto,
      // Buffer, libp2p native modules) that cannot be bundled for a browser/WebView
      // target. They are only reached via dynamic import inside syncWithRelay(), which
      // is only called from within the Tauri runtime — never from the WebView renderer.
      // Marking them external prevents Vite/Rollup from attempting to bundle them.
      external: ['@vco/vco-sync', '@vco/vco-transport'],
    },
  },
} as any);
