import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the bundle works on GitHub Pages project sites (/<repo>/) and Vercel alike.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
});
