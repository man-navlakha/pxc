// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pixel-classes.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
});

