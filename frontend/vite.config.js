import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import {resolve} from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // outDir: '../backend/dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, 'src'),
    },
  },
  preview: {
    allowedHosts: ["uat.ngeeann.zip", "bed.ngeeann.zip"]
  }
})