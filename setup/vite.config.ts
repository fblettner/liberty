import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from 'path';

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "../backend/app/public/setup",
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      "@ly_app": path.resolve(__dirname, 'src/app'),
      "@ly_components": path.resolve(__dirname, 'src/components'),
    },
  },
})