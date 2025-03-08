import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from 'path';

export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "nomana-it",
    project: "liberty-framework"
  })],
  server: {
    open: true,
    cors: { origin: "*" },
    proxy: {
      '/api': {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      '/socket.io': {
        target: "ws://localhost:8000",
        changeOrigin: true,
      },
      '/pgadmin': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/rundeck': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/oidc': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/portainer': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/airflow': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },      
      '/gitea': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },        
      '/socket': {
        target: "http://localhost:8000",
        changeOrigin: true,
      },     
  },

  },
  build: {
    outDir: "../liberty/framework/public/frontend",
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      // Map '@' to the 'src' directory for absolute imports
     // '@': path.resolve(__dirname, 'src'),
      "@ly_assets": path.resolve(__dirname, 'src/assets'),
      "@ly_app": path.resolve(__dirname, 'src/app'),
      "@ly_components": path.resolve(__dirname, 'src/components'),
      "@ly_styles": path.resolve(__dirname, 'src/styles'),
    },
  },
})